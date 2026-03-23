const mocks = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  readSessionCookieMock: vi.fn(),
  getAuthenticatedUserBySessionTokenMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookiesMock,
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirectMock,
}));

vi.mock('@/server/auth/session', () => ({
  readSessionCookie: mocks.readSessionCookieMock,
}));

vi.mock('@/server/auth/service', () => ({
  getAuthenticatedUserBySessionToken: mocks.getAuthenticatedUserBySessionTokenMock,
}));

import {
  getSessionUser,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
  requireAuth,
  requirePermission,
} from './guards';

const demoUser = {
  id: 'u-1',
  email: 'admin@poli.edu.co',
  name: 'Admin',
  estadoCuenta: 'ACTIVE',
  parqueoPermanente: false,
  role: {
    id: 'r-1',
    name: 'ADMIN',
    description: 'Administrador',
    permissions: ['auth.login', 'admin.user.manage', 'admin.reports.view'],
  },
};

describe('guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookiesMock.mockResolvedValue({});
  });

  it('requireAuth retorna usuario cuando la sesión es válida', async () => {
    mocks.readSessionCookieMock.mockReturnValue('token');
    mocks.getAuthenticatedUserBySessionTokenMock.mockResolvedValue(demoUser);

    const user = await requireAuth();

    expect(user).toEqual(demoUser);
    expect(mocks.redirectMock).not.toHaveBeenCalled();
  });

  it('requireAuth redirige cuando no hay cookie', async () => {
    mocks.readSessionCookieMock.mockReturnValue(null);

    await expect(requireAuth('/login')).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirectMock).toHaveBeenCalledWith('/login');
  });

  it('requireAuth redirige cuando el token no resuelve usuario', async () => {
    mocks.readSessionCookieMock.mockReturnValue('token');
    mocks.getAuthenticatedUserBySessionTokenMock.mockResolvedValue(null);

    await expect(requireAuth('/login')).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirectMock).toHaveBeenCalledWith('/login');
  });

  it('getSessionUser retorna null si no hay sesión', async () => {
    mocks.readSessionCookieMock.mockReturnValue(null);

    await expect(getSessionUser()).resolves.toBeNull();
  });

  it('getSessionUser retorna usuario autenticado', async () => {
    mocks.readSessionCookieMock.mockReturnValue('token');
    mocks.getAuthenticatedUserBySessionTokenMock.mockResolvedValue(demoUser);

    await expect(getSessionUser()).resolves.toEqual(demoUser);
  });

  it('requirePermission retorna usuario cuando tiene permiso', async () => {
    mocks.readSessionCookieMock.mockReturnValue('token');
    mocks.getAuthenticatedUserBySessionTokenMock.mockResolvedValue(demoUser);

    await expect(requirePermission('admin.user.manage')).resolves.toEqual(demoUser);
  });

  it('requirePermission redirige cuando falta permiso', async () => {
    mocks.readSessionCookieMock.mockReturnValue('token');
    mocks.getAuthenticatedUserBySessionTokenMock.mockResolvedValue({
      ...demoUser,
      role: { ...demoUser.role, permissions: ['auth.login'] },
    });

    await expect(requirePermission('admin.user.manage', '/dashboard')).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirectMock).toHaveBeenCalledWith('/dashboard');
  });

  it('hasPermission evalúa permisos puntuales', () => {
    expect(hasPermission(demoUser, 'admin.user.manage')).toBe(true);
    expect(hasPermission(demoUser, 'parking.reserve.create')).toBe(false);
  });

  it('hasAnyPermission evalúa existencia de cualquier permiso', () => {
    expect(hasAnyPermission(demoUser, ['x.y', 'admin.reports.view'])).toBe(true);
    expect(hasAnyPermission(demoUser, ['x.y', 'z.q'])).toBe(false);
  });

  it('hasAllPermissions exige todos los permisos', () => {
    expect(hasAllPermissions(demoUser, ['auth.login', 'admin.user.manage'])).toBe(true);
    expect(hasAllPermissions(demoUser, ['auth.login', 'parking.reserve.create'])).toBe(false);
  });

  it('hasRole compara rol exacto', () => {
    expect(hasRole(demoUser, 'ADMIN')).toBe(true);
    expect(hasRole(demoUser, 'DOCENTE')).toBe(false);
  });
});
