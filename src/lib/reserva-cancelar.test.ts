import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reserva } from './reserva';

describe('HU-06: Cancelar Reserva (Pruebas Unitarias Puras)', () => {
  
  // Creamos un objeto mock de prisma local para este archivo de pruebas
  const prismaMock = {
    reserva: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    plazaParqueo: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Prueba 1: Validar el criterio de aceptación obligatorio
  it('deberia retornar error si el estudiante no tiene una reserva activa', async () => {
    // Simulamos que el método findFirst devuelve null (no se encontró reserva activa)
    prismaMock.reserva.findFirst.mockResolvedValue(null);

    // Inyectamos el prismaMock como tercer parámetro
    const resultado = await Reserva.cancelarReservaUsuario('id-inexistente', 'usuario-123', prismaMock);

    expect(resultado).toEqual({
      ok: false,
      mensaje: 'No tienes ninguna reserva activa o vigente con el identificador proporcionado.',
    });
    
    // Verificamos que no se haya llamado a la base de datos para escribir cambios
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  // Prueba 2: Caso de éxito
  it('deberia cancelar la reserva y liberar la plaza si se encuentra activa', async () => {
    const reservaActivaFake = {
      id: 'reserva-ok',
      idUsuario: 'usuario-123',
      idPlaza: 'plaza-parqueo-7',
      estado: 'ACTIVA',
    };

    // Simulamos que encuentra la reserva y que la transacción se completa con éxito
    prismaMock.reserva.findFirst.mockResolvedValue(reservaActivaFake);
    prismaMock.$transaction.mockResolvedValue([]);

    // Inyectamos el prismaMock como tercer parámetro
    const resultado = await Reserva.cancelarReservaUsuario('reserva-ok', 'usuario-123', prismaMock);

    expect(resultado.ok).toBe(true);
    expect(resultado.mensaje).toContain('cancelada exitosamente');
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});