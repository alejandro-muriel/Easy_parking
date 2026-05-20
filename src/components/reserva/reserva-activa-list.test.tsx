import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReservaActivaList from './reserva-activa-list';

describe('ReservaActivaList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('muestra modal de confirmación y ejecuta extensión', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reservas: [
            {
              id: 'res-1',
              fechaHoraInicio: new Date().toISOString(),
              fechaHoraFin: new Date().toISOString(),
              estado: 'ACTIVA',
              extensionCount: 0,
              totalExtendedMinutes: 0,
              plaza: { id: 'p1', zona: 'A', fila: 'A', numero: 1, estado: 'RESERVADA', tipo: 'NORMAL' },
              horarioCompatible: true,
              horario: null,
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          status: 200,
          message: 'ok',
          reserva: {
            extensionMinutes: 20,
            extensionCount: 0,
            fechaHoraFin: new Date().toISOString(),
            nuevaFechaHoraFin: new Date().toISOString(),
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, message: 'extendida' }),
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: async () => ({ reservas: [] }),
      } as Response);

    render(<ReservaActivaList />);

    await waitFor(() => {
      expect(screen.getByText(/Zona A/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Extender' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Confirmar extensión' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith('/api/reservas/res-1/extend', {
        method: 'PATCH',
      });
    });
  });

  it('muestra mensaje de rechazo cuando can-extend falla', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reservas: [
            {
              id: 'res-1',
              fechaHoraInicio: new Date().toISOString(),
              fechaHoraFin: new Date().toISOString(),
              estado: 'ACTIVA',
              extensionCount: 0,
              totalExtendedMinutes: 0,
              plaza: { id: 'p1', zona: 'A', fila: 'A', numero: 1, estado: 'RESERVADA', tipo: 'NORMAL' },
              horarioCompatible: true,
              horario: null,
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          ok: false,
          message: 'No se puede extender: existe un usuario en cola con prioridad para esta plaza.',
        }),
      } as Response);

    render(<ReservaActivaList />);

    await waitFor(() => {
      expect(screen.getByText(/Zona A/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Extender' }));

    await waitFor(() => {
      expect(screen.getByText(/usuario en cola con prioridad/i)).toBeInTheDocument();
    });
  });
});
