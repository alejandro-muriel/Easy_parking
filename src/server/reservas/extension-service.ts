import { prisma } from '@/lib/prisma';
import {
  RESERVA_EXTENSION_MAX_COUNT,
  RESERVA_EXTENSION_MINUTES,
  RESERVA_EXTENSION_WINDOW_MINUTES,
} from '@/server/reservas/config';

const ROLES_HABILITADOS = new Set(['ESTUDIANTE', 'DOCENTE']);

type ExtendFailReason =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_STATE'
  | 'WINDOW_EXPIRED'
  | 'QUEUE_BLOCKED'
  | 'MAX_REACHED'
  | 'SCHEDULE_MISMATCH'
  | 'USER_CONFLICT'
  | 'PLAZA_CONFLICT'
  | 'PLAZA_BLOCKED';

class ExtensionConflictError extends Error {
  constructor(
    public readonly reason: ExtendFailReason,
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type CanExtendResult = {
  ok: boolean;
  status: number;
  reason?: ExtendFailReason;
  message: string;
  reserva?: {
    id: string;
    fechaHoraFin: Date;
    nuevaFechaHoraFin: Date;
    extensionMinutes: number;
    extensionCount: number;
  };
};

function toMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function dayNameEs(date: Date) {
  return date.toLocaleDateString('es', { weekday: 'long' }).toLowerCase();
}

export async function canExtendReserva(reservaId: string, userId: string): Promise<CanExtendResult> {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: {
      usuario: {
        include: {
          role: true,
        },
      },
      plaza: true,
      extensiones: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!reserva) {
    return { ok: false, status: 404, reason: 'NOT_FOUND', message: 'Reserva no encontrada.' };
  }

  if (reserva.idUsuario !== userId) {
    return { ok: false, status: 403, reason: 'FORBIDDEN', message: 'No puedes extender una reserva de otro usuario.' };
  }

  if (!ROLES_HABILITADOS.has(reserva.usuario.role.name)) {
    return { ok: false, status: 403, reason: 'FORBIDDEN', message: 'Solo estudiantes y docentes pueden extender reservas.' };
  }

  if (reserva.estado !== 'ACTIVA' && reserva.estado !== 'EXTENDIDA') {
    return { ok: false, status: 409, reason: 'INVALID_STATE', message: 'Solo las reservas activas o extendidas pueden extenderse.' };
  }

  const now = new Date();
  const windowLimit = new Date(reserva.fechaHoraFin.getTime() + RESERVA_EXTENSION_WINDOW_MINUTES * 60 * 1000);

  if (now > windowLimit) {
    return {
      ok: false,
      status: 409,
      reason: 'WINDOW_EXPIRED',
      message: `La extensión solo se permite hasta ${RESERVA_EXTENSION_WINDOW_MINUTES} minutos después de finalizar la reserva.`,
    };
  }

  if (reserva.extensiones.length >= RESERVA_EXTENSION_MAX_COUNT) {
    return {
      ok: false,
      status: 409,
      reason: 'MAX_REACHED',
      message: `Ya alcanzaste el máximo de ${RESERVA_EXTENSION_MAX_COUNT} extensiones para esta reserva.`,
    };
  }

  if (reserva.plaza.estado !== 'RESERVADA') {
    return {
      ok: false,
      status: 409,
      reason: 'PLAZA_BLOCKED',
      message: 'La plaza ya no está disponible para extensión.',
    };
  }

  const primeraColaActiva = await prisma.colaEspera.findFirst({
    where: {
      idPlaza: reserva.idPlaza,
      estado: 'ACTIVA',
    },
    orderBy: { fechaRegistro: 'asc' },
  });

  if (primeraColaActiva && primeraColaActiva.idUsuario !== userId) {
    return {
      ok: false,
      status: 409,
      reason: 'QUEUE_BLOCKED',
      message: 'No se puede extender: existe un usuario en cola con prioridad para esta plaza.',
    };
  }

  const nuevaFechaHoraFin = new Date(reserva.fechaHoraFin.getTime() + RESERVA_EXTENSION_MINUTES * 60 * 1000);

  const conflictoUsuario = await prisma.reserva.findFirst({
    where: {
      idUsuario: userId,
      id: { not: reserva.id },
      estado: { in: ['ACTIVA', 'EXTENDIDA'] },
      fechaHoraInicio: { lt: nuevaFechaHoraFin },
      fechaHoraFin: { gt: reserva.fechaHoraInicio },
    },
  });

  if (conflictoUsuario) {
    return {
      ok: false,
      status: 409,
      reason: 'USER_CONFLICT',
      message: 'No se puede extender porque se cruza con otra reserva activa del usuario.',
    };
  }

  const conflictoPlaza = await prisma.reserva.findFirst({
    where: {
      idPlaza: reserva.idPlaza,
      id: { not: reserva.id },
      estado: { in: ['ACTIVA', 'EXTENDIDA'] },
      fechaHoraInicio: { lt: nuevaFechaHoraFin },
      fechaHoraFin: { gt: reserva.fechaHoraFin },
    },
  });

  if (conflictoPlaza) {
    return {
      ok: false,
      status: 409,
      reason: 'PLAZA_CONFLICT',
      message: 'No se puede extender porque la plaza tiene una reserva posterior en conflicto.',
    };
  }

  const diaReserva = dayNameEs(reserva.fechaHoraInicio);
  const horarios = await prisma.horario.findMany({
    where: {
      idUsuario: userId,
      diaSemana: diaReserva,
    },
  });

  if (horarios.length === 0) {
    return {
      ok: false,
      status: 409,
      reason: 'SCHEDULE_MISMATCH',
      message: 'No existe horario académico compatible para la extensión.',
    };
  }

  const startMinutes = toMinutes(reserva.fechaHoraInicio);
  const endMinutesWithExtension = toMinutes(nuevaFechaHoraFin);

  const hayCompatibilidad = horarios.some((horario) => {
    const hStart = toMinutes(horario.horaInicio);
    const hEnd = toMinutes(horario.horaFin);

    if (startMinutes < hStart) {
      return false;
    }

    if (endMinutesWithExtension <= hEnd) {
      return true;
    }

    return endMinutesWithExtension <= hEnd + RESERVA_EXTENSION_WINDOW_MINUTES;
  });

  if (!hayCompatibilidad) {
    return {
      ok: false,
      status: 409,
      reason: 'SCHEDULE_MISMATCH',
      message: `La extensión excede tu horario académico permitido más la tolerancia de ${RESERVA_EXTENSION_WINDOW_MINUTES} minutos.`,
    };
  }

  return {
    ok: true,
    status: 200,
    message: 'La reserva puede extenderse.',
    reserva: {
      id: reserva.id,
      fechaHoraFin: reserva.fechaHoraFin,
      nuevaFechaHoraFin,
      extensionMinutes: RESERVA_EXTENSION_MINUTES,
      extensionCount: reserva.extensiones.length,
    },
  };
}

export async function extendReserva(reservaId: string, userId: string): Promise<CanExtendResult> {
  const validation = await canExtendReserva(reservaId, userId);

  if (!validation.ok || !validation.reserva) {
    return validation;
  }

  const extensionMinutes = validation.reserva.extensionMinutes;
  const nuevaFechaHoraFin = validation.reserva.nuevaFechaHoraFin;

  try {
    await prisma.$transaction(async (tx) => {
      const reservaActual = await tx.reserva.findUnique({
        where: { id: reservaId },
        include: {
          extensiones: true,
          plaza: true,
        },
      });

      if (!reservaActual) {
        throw new Error('Reserva no encontrada');
      }

      if (reservaActual.estado !== 'ACTIVA' && reservaActual.estado !== 'EXTENDIDA') {
        throw new ExtensionConflictError('INVALID_STATE', 409, 'La reserva ya no está activa.');
      }

      if (reservaActual.plaza.estado !== 'RESERVADA') {
        throw new ExtensionConflictError('PLAZA_BLOCKED', 409, 'La plaza ya no está disponible.');
      }

      const conflictoPlaza = await tx.reserva.findFirst({
        where: {
          idPlaza: reservaActual.idPlaza,
          id: { not: reservaId },
          estado: { in: ['ACTIVA', 'EXTENDIDA'] },
          fechaHoraInicio: { lt: nuevaFechaHoraFin },
          fechaHoraFin: { gt: reservaActual.fechaHoraFin },
        },
      });

      if (conflictoPlaza) {
        throw new ExtensionConflictError('PLAZA_CONFLICT', 409, 'Conflicto de disponibilidad detectado durante la extensión.');
      }

      await tx.reservaExtension.create({
        data: {
          reservaId,
          minutosExtendidos: extensionMinutes,
          fechaHoraFinAnterior: reservaActual.fechaHoraFin,
          fechaHoraFinNueva: nuevaFechaHoraFin,
        },
      });

      await tx.reserva.update({
        where: { id: reservaId },
        data: {
          fechaHoraFin: nuevaFechaHoraFin,
          estado: 'EXTENDIDA',
        },
      });

      await tx.plazaParqueo.update({
        where: { id: reservaActual.idPlaza },
        data: {
          estado: 'RESERVADA',
          ultimoCambio: new Date(),
        },
      });
    });
  } catch (error) {
    if (error instanceof ExtensionConflictError) {
      return { ok: false, status: error.status, reason: error.reason, message: error.message };
    }
    throw error;
  }

  return {
    ok: true,
    status: 200,
    message: `Reserva extendida ${extensionMinutes} minutos correctamente.`,
    reserva: {
      id: reservaId,
      fechaHoraFin: validation.reserva.fechaHoraFin,
      nuevaFechaHoraFin,
      extensionMinutes,
      extensionCount: validation.reserva.extensionCount + 1,
    },
  };
}
