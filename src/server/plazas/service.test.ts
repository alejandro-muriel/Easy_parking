import { describe, it, expect, vi, beforeEach } from 'vitest';
import { obtenerTodasLasPlazas, obtenerPlazaPorId, asignarPlaza, liberarPlaza } from './service';
import { EstadoPlaza } from '@prisma/client';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    plazaParqueo: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockPrisma = vi.mocked((await import('@/lib/prisma')).prisma);

describe('Plazas Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obtenerTodasLasPlazas', () => {
    it('deberia obtener todas las plazas ordenadas', async () => {
      const mockPlazas = [
        { id: '1', zona: 'A', fila: '1', numero: 1, estado: EstadoPlaza.DISPONIBLE },
      ];

      mockPrisma.plazaParqueo.findMany.mockResolvedValue(mockPlazas);

      const result = await obtenerTodasLasPlazas();

      expect(mockPrisma.plazaParqueo.findMany).toHaveBeenCalledWith({
        orderBy: [{ zona: 'asc' }, { fila: 'asc' }, { numero: 'asc' }],
      });
      expect(result).toEqual(mockPlazas);
    });
  });

  describe('obtenerPlazaPorId', () => {
    it('deberia obtener plaza por id', async () => {
      const mockPlaza = { id: '1', zona: 'A', fila: '1', numero: 1, estado: EstadoPlaza.DISPONIBLE };

      mockPrisma.plazaParqueo.findUnique.mockResolvedValue(mockPlaza);

      const result = await obtenerPlazaPorId('1');

      expect(mockPrisma.plazaParqueo.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockPlaza);
    });
  });

  describe('asignarPlaza', () => {
    it('deberia asignar plaza disponible', async () => {
      const mockPlaza = { id: '1', zona: 'A', fila: '1', numero: 1, estado: EstadoPlaza.DISPONIBLE };

      mockPrisma.plazaParqueo.findUnique.mockResolvedValue(mockPlaza);
      mockPrisma.plazaParqueo.update.mockResolvedValue({} as any);

      const result = await asignarPlaza('1');

      expect(result).toEqual({ ok: true, mensaje: 'Plaza asignada correctamente.' });
      expect(mockPrisma.plazaParqueo.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { estado: EstadoPlaza.OCUPADA, ultimoCambio: expect.any(Date) },
      });
    });

    it('deberia fallar si plaza no disponible', async () => {
      const mockPlaza = { id: '1', zona: 'A', fila: '1', numero: 1, estado: EstadoPlaza.OCUPADA };

      mockPrisma.plazaParqueo.findUnique.mockResolvedValue(mockPlaza);

      const result = await asignarPlaza('1');

      expect(result).toEqual({ ok: false, mensaje: 'La plaza no está disponible. Estado actual: OCUPADA' });
    });

    it('deberia fallar si plaza no encontrada', async () => {
      mockPrisma.plazaParqueo.findUnique.mockResolvedValue(null);

      const result = await asignarPlaza('1');

      expect(result).toEqual({ ok: false, mensaje: 'Plaza no encontrada.' });
    });
  });

  describe('liberarPlaza', () => {
    it('deberia liberar plaza ocupada', async () => {
      const mockPlaza = { id: '1', zona: 'A', fila: '1', numero: 1, estado: EstadoPlaza.OCUPADA };

      mockPrisma.plazaParqueo.findUnique.mockResolvedValue(mockPlaza);
      mockPrisma.plazaParqueo.update.mockResolvedValue({} as any);

      const result = await liberarPlaza('1');

      expect(result.ok).toBe(true);
      expect(result.mensaje).toMatch(/Plaza liberada y bloqueada temporalmente/);
      expect(mockPrisma.plazaParqueo.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          estado: EstadoPlaza.BLOQUEADA,
          ultimoCambio: expect.any(Date),
          bloqueoTemporalHasta: expect.any(Date),
        },
      });
    });

    it('deberia fallar si plaza no puede liberarse', async () => {
      const mockPlaza = { id: '1', zona: 'A', fila: '1', numero: 1, estado: EstadoPlaza.DISPONIBLE };

      mockPrisma.plazaParqueo.findUnique.mockResolvedValue(mockPlaza);

      const result = await liberarPlaza('1');

      expect(result).toEqual({ ok: false, mensaje: 'La plaza no puede liberarse. Estado actual: DISPONIBLE' });
    });
  });
});