import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  obtenerTodasLasPlazas,
  obtenerPlazaPorId,
  asignarPlaza,
  liberarPlaza,
  obtenerPlazasMapa,
  calcularStatsPlazas,
} from './service';
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

  describe('obtenerPlazasMapa', () => {
    it('deberia obtener plazas de mapa con select y orden base', async () => {
      const mockPlazas = [
        {
          id: '1',
          zona: 'A',
          fila: '1',
          numero: 1,
          estado: EstadoPlaza.DISPONIBLE,
          tipo: 'NORMAL',
          bloqueoTemporalHasta: null,
        },
      ];

      mockPrisma.plazaParqueo.findMany.mockResolvedValue(mockPlazas as any);

      const result = await obtenerPlazasMapa();

      expect(mockPrisma.plazaParqueo.findMany).toHaveBeenCalledWith({
        where: undefined,
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
      expect(result).toEqual(mockPlazas);
    });

    it('deberia aplicar filtros de estado y zona', async () => {
      mockPrisma.plazaParqueo.findMany.mockResolvedValue([] as any);

      await obtenerPlazasMapa({ estado: EstadoPlaza.OCUPADA, zona: 'B' });

      expect(mockPrisma.plazaParqueo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: EstadoPlaza.OCUPADA, zona: 'B' },
        }),
      );
    });
  });

  describe('calcularStatsPlazas', () => {
    it('deberia calcular contadores por estado', () => {
      const stats = calcularStatsPlazas([
        {
          id: '1',
          zona: 'A',
          fila: '1',
          numero: 1,
          estado: EstadoPlaza.DISPONIBLE,
          tipo: 'NORMAL',
          bloqueoTemporalHasta: null,
        },
        {
          id: '2',
          zona: 'A',
          fila: '1',
          numero: 2,
          estado: EstadoPlaza.OCUPADA,
          tipo: 'NORMAL',
          bloqueoTemporalHasta: null,
        },
        {
          id: '3',
          zona: 'A',
          fila: '1',
          numero: 3,
          estado: EstadoPlaza.RESERVADA,
          tipo: 'PREFERENCIAL',
          bloqueoTemporalHasta: null,
        },
        {
          id: '4',
          zona: 'B',
          fila: '2',
          numero: 1,
          estado: EstadoPlaza.BLOQUEADA,
          tipo: 'PERMANENTE',
          bloqueoTemporalHasta: new Date(),
        },
      ]);

      expect(stats).toEqual({
        total: 4,
        disponibles: 1,
        ocupadas: 1,
        reservadas: 1,
        bloqueadas: 1,
      });
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