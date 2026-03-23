import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('envia credenciales y redirige cuando el login es exitoso', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    render(<LoginForm redirectTo="/dashboard" />);

    await user.type(screen.getByLabelText('Correo Institucional'), 'admin@poli.edu.co');
    await user.type(screen.getByLabelText('Contraseña'), 'Test123!');
    await user.click(screen.getByRole('button', { name: 'Ingresar al Sistema' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@poli.edu.co',
          password: 'Test123!',
        }),
      });
    });

    expect(pushMock).toHaveBeenCalledWith('/dashboard');
    expect(refreshMock).toHaveBeenCalled();
  });

  it('muestra mensaje de error cuando la API responde con error', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Credenciales inválidas.' }),
    } as Response);

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Correo Institucional'), 'admin@poli.edu.co');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Ingresar al Sistema' }));

    expect(await screen.findByText('Credenciales inválidas.')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('muestra error genérico cuando fetch falla', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Correo Institucional'), 'admin@poli.edu.co');
    await user.type(screen.getByLabelText('Contraseña'), 'Test123!');
    await user.click(screen.getByRole('button', { name: 'Ingresar al Sistema' }));

    expect(
      await screen.findByText('Ocurrió un error inesperado al iniciar sesión.'),
    ).toBeInTheDocument();
  });
});
