import { prisma } from '@/lib/prisma';
import { EstadoPlaza } from '@prisma/client';

const BLOQUEO_TEMPORAL_MS = 5 * 60 * 1000; // 5 minutos

export async function obtenerTodasLasPlazas() {
  return prisma.plazaParqueo.findMany({
    orderBy: [{ zona: 'asc' }, { fila: 'asc' }, { numero: 'asc' }],
  });
}

export async function obtenerPlazaPorId(id: string) {
  return prisma.plazaParqueo.findUnique({ where: { id } });
}

export async function asignarPlaza(plazaId: string) {
  const plaza = await obtenerPlazaPorId(plazaId);

  if (!plaza) return { ok: false, mensaje: 'Plaza no encontrada.' };

  if (plaza.estado !== EstadoPlaza.DISPONIBLE) {
    return { ok: false, mensaje: `La plaza no está disponible. Estado actual: ${plaza.estado}` };
  }

  await prisma.plazaParqueo.update({
    where: { id: plazaId },
    data: { estado: EstadoPlaza.OCUPADA, ultimoCambio: new Date() },
  });

  return { ok: true, mensaje: 'Plaza asignada correctamente.' };
}

export async function liberarPlaza(plazaId: string) {
  const plaza = await obtenerPlazaPorId(plazaId);

  if (!plaza) return { ok: false, mensaje: 'Plaza no encontrada.' };

  if (plaza.estado !== EstadoPlaza.OCUPADA && plaza.estado !== EstadoPlaza.RESERVADA) {
    return { ok: false, mensaje: `La plaza no puede liberarse. Estado actual: ${plaza.estado}` };
  }

  const bloqueoHasta = new Date(Date.now() + BLOQUEO_TEMPORAL_MS);

  await prisma.plazaParqueo.update({
    where: { id: plazaId },
    data: {
      estado: EstadoPlaza.BLOQUEADA,
      ultimoCambio: new Date(),
      bloqueoTemporalHasta: bloqueoHasta,
    },
  });

  return {
    ok: true,
    mensaje: `Plaza liberada y bloqueada temporalmente hasta las ${bloqueoHasta.toLocaleTimeString('es-CO')}.`,
  };
}

export async function desbloquearPlazasExpiradas() {
  const ahora = new Date();
  await prisma.plazaParqueo.updateMany({
    where: {
      estado: EstadoPlaza.BLOQUEADA,
      bloqueoTemporalHasta: { lte: ahora },
    },
    data: {
      estado: EstadoPlaza.DISPONIBLE,
      bloqueoTemporalHasta: null,
      ultimoCambio: ahora,
    },
  });
  
}
// Bloquear manualmente una plaza
export async function bloquearPlaza(plazaId: string) {
  const plaza = await obtenerPlazaPorId(plazaId);

  if (!plaza) return { ok: false, mensaje: 'Plaza no encontrada.' };

  if (plaza.estado !== EstadoPlaza.DISPONIBLE) {
    return { ok: false, mensaje: `Solo se pueden bloquear plazas disponibles. Estado actual: ${plaza.estado}` };
  }

  await prisma.plazaParqueo.update({
    where: { id: plazaId },
    data: {
      estado: EstadoPlaza.BLOQUEADA,
      ultimoCambio: new Date(),
      bloqueoTemporalHasta: null,
    },
  });

  return { ok: true, mensaje: 'Plaza bloqueada manualmente.' };
}

// Desbloquear manualmente una plaza bloqueada
export async function desbloquearPlaza(plazaId: string) {
  const plaza = await obtenerPlazaPorId(plazaId);

  if (!plaza) return { ok: false, mensaje: 'Plaza no encontrada.' };

  if (plaza.estado !== EstadoPlaza.BLOQUEADA) {
    return { ok: false, mensaje: `La plaza no está bloqueada. Estado actual: ${plaza.estado}` };
  }

  await prisma.plazaParqueo.update({
    where: { id: plazaId },
    data: {
      estado: EstadoPlaza.DISPONIBLE,
      ultimoCambio: new Date(),
      bloqueoTemporalHasta: null,
    },
  });

  return { ok: true, mensaje: 'Plaza desbloqueada y disponible.' };
}