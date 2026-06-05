// Tests HU-07: liberación automática de plazas vencidas

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { liberarPlazasVencidas } from './liberar.service';

// Simulamos prisma y plazas/service para no tocar la base de datos real
vi.mock('@/lib/prisma', () => ({
  prisma: {
    reserva: {
      findMany: vi.fn(),
      update:   vi.fn(),
    },
    colaEspera: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/server/plazas/service', () => ({
  liberarPlaza:               vi.fn(),
  desbloquearPlazasExpiradas: vi.fn(),
}));

import { prisma }                                      from '@/lib/prisma';
import { liberarPlaza, desbloquearPlazasExpiradas }    from '@/server/plazas/service';

beforeEach(() => { vi.clearAllMocks(); });

describe('liberarPlazasVencidas', () => {

  it('no procesa nada si no hay reservas vencidas', async () => {
    vi.mocked(prisma.reserva.findMany).mockResolvedValue([]);

    const resultado = await liberarPlazasVencidas();

    expect(resultado.procesadas).toBe(0);
    expect(resultado.liberadas).toBe(0);
    expect(liberarPlaza).not.toHaveBeenCalled();
  });

  it('espera 10 min si la plaza estaba RESERVADA (usuario no llegó)', async () => {
    // Reserva que venció hace solo 6 minutos — aún no deben pasar los 10
    const haceSeisMin = new Date(Date.now() - 6 * 60 * 1000);
    vi.mocked(prisma.reserva.findMany).mockResolvedValue([
      { id: 'r1', idPlaza: 'p1', fechaHoraFin: haceSeisMin,
        plaza: { estado: 'RESERVADA' } } as any,
    ]);

    const resultado = await liberarPlazasVencidas();

    expect(resultado.liberadas).toBe(0);
    expect(liberarPlaza).not.toHaveBeenCalled();
  });

  it('libera tras 5 min si la plaza estaba OCUPADA (usuario llegó)', async () => {
    // Reserva que venció hace 6 minutos con plaza OCUPADA — sí debe liberarse
    const haceSeisMin = new Date(Date.now() - 6 * 60 * 1000);
    vi.mocked(prisma.reserva.findMany).mockResolvedValue([
      { id: 'r2', idPlaza: 'p2', fechaHoraFin: haceSeisMin,
        plaza: { estado: 'OCUPADA' } } as any,
    ]);
    vi.mocked(prisma.reserva.update).mockResolvedValue({} as any);
    vi.mocked(liberarPlaza).mockResolvedValue({ ok: true, mensaje: 'ok' });
    vi.mocked(prisma.colaEspera.findFirst).mockResolvedValue(null);

    const resultado = await liberarPlazasVencidas();

    expect(resultado.liberadas).toBe(1);
    expect(liberarPlaza).toHaveBeenCalledWith('p2');
  });

  it('libera tras 10 min si la plaza estaba RESERVADA (usuario no llegó)', async () => {
    // Reserva que venció hace 11 minutos con plaza RESERVADA — sí debe liberarse
    const haceOnceMin = new Date(Date.now() - 11 * 60 * 1000);
    vi.mocked(prisma.reserva.findMany).mockResolvedValue([
      { id: 'r3', idPlaza: 'p3', fechaHoraFin: haceOnceMin,
        plaza: { estado: 'RESERVADA' } } as any,
    ]);
    vi.mocked(prisma.reserva.update).mockResolvedValue({} as any);
    vi.mocked(liberarPlaza).mockResolvedValue({ ok: true, mensaje: 'ok' });
    vi.mocked(prisma.colaEspera.findFirst).mockResolvedValue(null);

    const resultado = await liberarPlazasVencidas();

    expect(resultado.liberadas).toBe(1);
  });

  it('reporta en conCola si hay alguien esperando la plaza', async () => {
    const haceOnceMin = new Date(Date.now() - 11 * 60 * 1000);
    vi.mocked(prisma.reserva.findMany).mockResolvedValue([
      { id: 'r4', idPlaza: 'p4', fechaHoraFin: haceOnceMin,
        plaza: { estado: 'RESERVADA' } } as any,
    ]);
    vi.mocked(prisma.reserva.update).mockResolvedValue({} as any);
    vi.mocked(liberarPlaza).mockResolvedValue({ ok: true, mensaje: 'ok' });
    vi.mocked(prisma.colaEspera.findFirst).mockResolvedValue(
      { id: 'c1', idUsuario: 'u1', idPlaza: 'p4' } as any
    );

    const resultado = await liberarPlazasVencidas();

    expect(resultado.conCola).toContain('p4');
  });

  it('registra error si liberarPlaza falla', async () => {
    const haceOnceMin = new Date(Date.now() - 11 * 60 * 1000);
    vi.mocked(prisma.reserva.findMany).mockResolvedValue([
      { id: 'r5', idPlaza: 'p5', fechaHoraFin: haceOnceMin,
        plaza: { estado: 'RESERVADA' } } as any,
    ]);
    vi.mocked(prisma.reserva.update).mockResolvedValue({} as any);
    vi.mocked(liberarPlaza).mockResolvedValue({ ok: false, mensaje: 'Plaza no encontrada.' });

    const resultado = await liberarPlazasVencidas();

    expect(resultado.liberadas).toBe(0);
    expect(resultado.errores.length).toBeGreaterThan(0);
  });

});