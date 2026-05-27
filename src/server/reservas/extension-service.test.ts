import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    reserva: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    horario: {
      findMany: vi.fn(),
    },
    colaEspera: {
      findFirst: vi.fn(),
    },
    plazaParqueo: {
      update: vi.fn(),
    },
    reservaExtension: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from '@/lib/prisma';
import { canExtendReserva, extendReserva } from './extension-service';

function buildReserva() {
  const now = new Date();
  const fechaHoraInicio = new Date(now.getTime() - 30 * 60 * 1000);
  const fechaHoraFin = new Date(now.getTime() + 10 * 60 * 1000);

  return {
    id: 'res-1',
    idUsuario: 'user-1',
    idPlaza: 'plaza-1',
    estado: 'ACTIVA',
    fechaHoraInicio,
    fechaHoraFin,
    usuario: {
      role: {
        name: 'ESTUDIANTE',
      },
    },
    plaza: {
      id: 'plaza-1',
      estado: 'RESERVADA',
    },
    extensiones: [],
  };
}

describe('extension-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rechaza extensión cuando la cola activa pertenece a otro usuario', async () => {
    vi.mocked(prisma.reserva.findUnique).mockResolvedValue(buildReserva() as any);
    vi.mocked(prisma.colaEspera.findFirst).mockResolvedValue({
      id: 'cola-1',
      idUsuario: 'user-otro',
      idPlaza: 'plaza-1',
      estado: 'ACTIVA',
      fechaRegistro: new Date(),
    } as any);

    const result = await canExtendReserva('res-1', 'user-1');

    expect(result.ok).toBe(false);
    expect(result.status).toBe(409);
    expect(result.reason).toBe('QUEUE_BLOCKED');
  });

  it('permite extensión cuando cumple reglas base', async () => {
    const reserva = buildReserva();
    const diaSemana = reserva.fechaHoraInicio.toLocaleDateString('es', { weekday: 'long' }).toLowerCase();

    vi.mocked(prisma.reserva.findUnique).mockResolvedValue(reserva as any);
    vi.mocked(prisma.colaEspera.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.reserva.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.horario.findMany).mockResolvedValue([
      {
        id: 'h-1',
        materia: 'Programacion',
        horaInicio: new Date(reserva.fechaHoraInicio.getTime() - 60 * 60 * 1000),
        horaFin: new Date(reserva.fechaHoraFin.getTime() + 120 * 60 * 1000),
        diaSemana,
      },
    ] as any);

    const result = await canExtendReserva('res-1', 'user-1');

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.reserva?.extensionMinutes).toBeGreaterThan(0);
  });

  it('extiende reserva y registra historial de extensión', async () => {
    const reserva = buildReserva();
    const diaSemana = reserva.fechaHoraInicio.toLocaleDateString('es', { weekday: 'long' }).toLowerCase();

    vi.mocked(prisma.reserva.findUnique).mockResolvedValue(reserva as any);
    vi.mocked(prisma.colaEspera.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.reserva.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.horario.findMany).mockResolvedValue([
      {
        id: 'h-1',
        materia: 'Programacion',
        horaInicio: new Date(reserva.fechaHoraInicio.getTime() - 60 * 60 * 1000),
        horaFin: new Date(reserva.fechaHoraFin.getTime() + 120 * 60 * 1000),
        diaSemana,
      },
    ] as any);

    const tx = {
      reserva: {
        findUnique: vi.fn().mockResolvedValue(reserva),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({ id: 'res-1' }),
      },
      reservaExtension: {
        create: vi.fn().mockResolvedValue({ id: 'ext-1' }),
      },
      plazaParqueo: {
        update: vi.fn().mockResolvedValue({ id: 'plaza-1' }),
      },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx));

    const result = await extendReserva('res-1', 'user-1');

    expect(result.ok).toBe(true);
    expect(tx.reservaExtension.create).toHaveBeenCalled();
    expect(tx.reserva.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estado: 'EXTENDIDA' }) }),
    );
    expect(tx.plazaParqueo.update).toHaveBeenCalled();
  });

  it('rechaza extensión cuando la plaza está BLOQUEADA', async () => {
    const reserva = { ...buildReserva(), plaza: { id: 'plaza-1', estado: 'BLOQUEADA' } };
    vi.mocked(prisma.reserva.findUnique).mockResolvedValue(reserva as any);

    const result = await canExtendReserva('res-1', 'user-1');

    expect(result.ok).toBe(false);
    expect(result.status).toBe(409);
    expect(result.reason).toBe('PLAZA_BLOCKED');
  });

  it('rechaza extensión cuando la plaza está OCUPADA', async () => {
    const reserva = { ...buildReserva(), plaza: { id: 'plaza-1', estado: 'OCUPADA' } };
    vi.mocked(prisma.reserva.findUnique).mockResolvedValue(reserva as any);

    const result = await canExtendReserva('res-1', 'user-1');

    expect(result.ok).toBe(false);
    expect(result.status).toBe(409);
    expect(result.reason).toBe('PLAZA_BLOCKED');
  });

  it('acepta extensión de reserva con estado EXTENDIDA', async () => {
    const reserva = { ...buildReserva(), estado: 'EXTENDIDA', extensiones: [] };
    const diaSemana = reserva.fechaHoraInicio.toLocaleDateString('es', { weekday: 'long' }).toLowerCase();

    vi.mocked(prisma.reserva.findUnique).mockResolvedValue(reserva as any);
    vi.mocked(prisma.colaEspera.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.reserva.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.horario.findMany).mockResolvedValue([
      {
        id: 'h-1',
        materia: 'Programacion',
        horaInicio: new Date(reserva.fechaHoraInicio.getTime() - 60 * 60 * 1000),
        horaFin: new Date(reserva.fechaHoraFin.getTime() + 120 * 60 * 1000),
        diaSemana,
      },
    ] as any);

    const result = await canExtendReserva('res-1', 'user-1');

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
  });

  it('rechaza dentro de la transacción si la plaza cambia de estado (race condition)', async () => {
    const reserva = buildReserva();
    const diaSemana = reserva.fechaHoraInicio.toLocaleDateString('es', { weekday: 'long' }).toLowerCase();

    vi.mocked(prisma.reserva.findUnique).mockResolvedValue(reserva as any);
    vi.mocked(prisma.colaEspera.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.reserva.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.horario.findMany).mockResolvedValue([
      {
        id: 'h-1',
        materia: 'Programacion',
        horaInicio: new Date(reserva.fechaHoraInicio.getTime() - 60 * 60 * 1000),
        horaFin: new Date(reserva.fechaHoraFin.getTime() + 120 * 60 * 1000),
        diaSemana,
      },
    ] as any);

    const tx = {
      reserva: {
        findUnique: vi.fn().mockResolvedValue({ ...reserva, plaza: { id: 'plaza-1', estado: 'BLOQUEADA' } }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      reservaExtension: { create: vi.fn() },
      plazaParqueo: { update: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx));

    const result = await extendReserva('res-1', 'user-1');

    expect(result.ok).toBe(false);
    expect(result.status).toBe(409);
    expect(result.reason).toBe('PLAZA_BLOCKED');
    expect(tx.reserva.update).not.toHaveBeenCalled();
  });
});
