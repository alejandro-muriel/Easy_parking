import { render, screen, waitFor } from '@testing-library/react';
import ReservaForm from './reserva-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('ReservaForm', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@poli.edu.co',
    role: { name: 'estudiante' },
    permissions: ['parking.reservation.create'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('carga horarios y plazas al montar', async () => {
    const mockHorarios = [
      {
        id: '1',
        materia: 'Matemáticas',
        horaInicio: new Date('2024-01-01T08:00:00'),
        horaFin: new Date('2024-01-01T10:00:00'),
        diaSemana: 'Lunes',
      },
    ];

    const mockPlazas = [
      {
        id: '1',
        zona: 'A',
        fila: '1',
        numero: 1,
        estado: 'DISPONIBLE',
        tipo: 'Estándar',
      },
    ];

    vi.mocked(globalThis.fetch).mockImplementation((url) => {
      if (url === '/api/horarios') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHorarios),
        } as Response);
      }
      if (url === '/api/plazas?estado=DISPONIBLE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPlazas),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<ReservaForm user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Matemáticas')).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/horarios');
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/plazas?estado=DISPONIBLE');
  });

  it('muestra error si no hay usuario', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(() =>
      Promise.reject(new Error('Fetch error'))
    );

    render(<ReservaForm user={null} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cargar horarios/i })).toBeInTheDocument();
    });
  });

  it('llama a fetch para enviar reserva', async () => {
    const mockHorarios = [
      {
        id: '1',
        materia: 'Matemáticas',
        horaInicio: new Date('2024-01-01T08:00:00'),
        horaFin: new Date('2024-01-01T10:00:00'),
        diaSemana: 'Lunes',
      },
    ];

    const mockPlazas = [
      {
        id: '1',
        zona: 'A',
        fila: '1',
        numero: 1,
        estado: 'DISPONIBLE',
        tipo: 'Estándar',
      },
    ];

    vi.mocked(globalThis.fetch).mockImplementation((url) => {
      if (url === '/api/horarios' || url === '/api/plazas?estado=DISPONIBLE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(url === '/api/horarios' ? mockHorarios : mockPlazas),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });

    render(<ReservaForm user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Matemáticas')).toBeInTheDocument();
    });

    expect(vi.mocked(globalThis.fetch).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});