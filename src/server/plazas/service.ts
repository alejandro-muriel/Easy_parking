import { prisma } from '@/lib/prisma';
import { EstadoPlaza } from '@prisma/client';

const BLOQUEO_TEMPORAL_MS = 5 * 60 * 1000; // 5 minutos

export type PlazaMapa = {
  id: string;
  zona: string;
  fila: string;
  numero: number;
  estado: EstadoPlaza;
  tipo: string;
  bloqueoTemporalHasta: Date | null;
};

export type PlazaMapaStats = {
  total: number;
  disponibles: number;
  ocupadas: number;
  reservadas: number;
  bloqueadas: number;
};

type ObtenerPlazasMapaParams = {
  estado?: EstadoPlaza;
  zona?: string;
};

export async function obtenerPlazasMapa(params: ObtenerPlazasMapaParams = {}): Promise<PlazaMapa[]> {
  const where: { estado?: EstadoPlaza; zona?: string } = {};

  if (params.estado) {
    where.estado = params.estado;
  }

  if (params.zona) {
    where.zona = params.zona;
  }

  return prisma.plazaParqueo.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    select: {
      id: true,
      zona: true,
      fila: true,
      numero: true,
      estado: true,
      tipo: true,
      bloqueoTemporalHasta: true,
    },
    orderBy: [{ zona: 'asc' }, { fila: 'asc' }, { numero: 'asc' }],
  });
}

export function calcularStatsPlazas(plazas: PlazaMapa[]): PlazaMapaStats {
  return plazas.reduce<PlazaMapaStats>(
    (acc, plaza) => {
      acc.total += 1;

      if (plaza.estado === EstadoPlaza.DISPONIBLE) acc.disponibles += 1;
      if (plaza.estado === EstadoPlaza.OCUPADA) acc.ocupadas += 1;
      if (plaza.estado === EstadoPlaza.RESERVADA) acc.reservadas += 1;
      if (plaza.estado === EstadoPlaza.BLOQUEADA) acc.bloqueadas += 1;

      return acc;
    },
    {
      total: 0,
      disponibles: 0,
      ocupadas: 0,
      reservadas: 0,
      bloqueadas: 0,
    },
  );
}

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