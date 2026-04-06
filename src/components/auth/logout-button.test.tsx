import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogoutButton } from './logout-button';

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('ejecuta logout y redirige a login', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockResolvedValue({ ok: true } as Response);

    render(<LogoutButton />);
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    });

    expect(pushMock).toHaveBeenCalledWith('/login');
    expect(refreshMock).toHaveBeenCalled();
  });

  it('redirige a login incluso si el endpoint falla', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('endpoint down'));

    render(<LogoutButton />);
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });

    expect(refreshMock).toHaveBeenCalled();
  });
});
