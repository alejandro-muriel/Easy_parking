const mocks = vi.hoisted(() => ({
  compareMock: vi.fn(),
  generateSessionTokenMock: vi.fn(),
  hashSessionTokenMock: vi.fn(),
  getSessionExpiryDateMock: vi.fn(),
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: mocks.compareMock,
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mocks.mockPrisma,
}));

vi.mock('./session', () => ({
  generateSessionToken: mocks.generateSessionTokenMock,
  hashSessionToken: mocks.hashSessionTokenMock,
  getSessionExpiryDate: mocks.getSessionExpiryDateMock,
}));

import {
  authenticateUser,
  getAuthenticatedUserBySessionToken,
  revokeSession,
} from './service';

const demoUser = {
  id: 'user-1',
  email: 'admin@poli.edu.co',
  name: 'Admin',
  passwordHash: 'hashed-password',
  roleId: 'role-1',
  parqueoPermanente: false,
  estadoCuenta: 'ACTIVE',
  role: {
    id: 'role-1',
    name: 'ADMIN',
    description: 'Administrador',
    rolePermissions: [
      { permission: { key: 'auth.login' } },
      { permission: { key: 'admin.user.manage' } },
    ],
  },
};

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockPrisma.user.update.mockReturnValue({ op: 'user.update' });
    mocks.mockPrisma.session.create.mockReturnValue({ op: 'session.create' });
    mocks.mockPrisma.$transaction.mockResolvedValue([]);

    mocks.generateSessionTokenMock.mockReturnValue('raw-token');
    mocks.hashSessionTokenMock.mockImplementation((token: string) => `hashed-${token}`);
    mocks.getSessionExpiryDateMock.mockReturnValue(new Date('2030-01-01T00:00:00.000Z'));
  });

  it('rechaza cuando email o contraseña son vacíos', async () => {
    const result = await authenticateUser({ email: '   ', password: '   ' });

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: 'Email y contraseña son obligatorios.',
    });
    expect(mocks.mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rechaza cuando usuario no existe', async () => {
    mocks.mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await authenticateUser({ email: 'x@poli.edu.co', password: 'Test123!' });

    expect(result).toEqual({
      ok: false,
      status: 401,
      message: 'Credenciales inválidas.',
    });
  });

  it('rechaza cuando la cuenta no está activa', async () => {
    mocks.mockPrisma.user.findUnique.mockResolvedValue({
      ...demoUser,
      estadoCuenta: 'SUSPENDED',
    });

    const result = await authenticateUser({ email: 'admin@poli.edu.co', password: 'Test123!' });

    expect(result).toEqual({
      ok: false,
      status: 403,
      message: 'La cuenta no está habilitada para iniciar sesión.',
    });
  });

  it('rechaza cuando contraseña no coincide', async () => {
    mocks.mockPrisma.user.findUnique.mockResolvedValue(demoUser);
    mocks.compareMock.mockResolvedValue(false);

    const result = await authenticateUser({ email: 'admin@poli.edu.co', password: 'wrong' });

    expect(result).toEqual({
      ok: false,
      status: 401,
      message: 'Credenciales inválidas.',
    });
  });

  it('autentica, crea sesión y retorna usuario mapeado', async () => {
    mocks.mockPrisma.user.findUnique.mockResolvedValue(demoUser);
    mocks.compareMock.mockResolvedValue(true);

    const result = await authenticateUser({
      email: '  ADMIN@POLI.EDU.CO  ',
      password: 'Test123!',
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    });

    expect(mocks.mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'admin@poli.edu.co' },
      }),
    );

    expect(mocks.mockPrisma.$transaction).toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      sessionToken: 'raw-token',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      user: {
        id: 'user-1',
        email: 'admin@poli.edu.co',
        name: 'Admin',
        estadoCuenta: 'ACTIVE',
        parqueoPermanente: false,
        role: {
          id: 'role-1',
          name: 'ADMIN',
          description: 'Administrador',
          permissions: ['auth.login', 'admin.user.manage'],
        },
      },
    });
  });

  it('getAuthenticatedUserBySessionToken retorna null si no encuentra sesión', async () => {
    mocks.mockPrisma.session.findFirst.mockResolvedValue(null);

    const result = await getAuthenticatedUserBySessionToken('raw-token');

    expect(mocks.hashSessionTokenMock).toHaveBeenCalledWith('raw-token');
    expect(result).toBeNull();
  });

  it('getAuthenticatedUserBySessionToken retorna null si usuario no está activo', async () => {
    mocks.mockPrisma.session.findFirst.mockResolvedValue({
      user: {
        ...demoUser,
        estadoCuenta: 'INACTIVE',
      },
    });

    const result = await getAuthenticatedUserBySessionToken('raw-token');

    expect(result).toBeNull();
  });

  it('getAuthenticatedUserBySessionToken retorna usuario cuando la sesión es válida', async () => {
    mocks.mockPrisma.session.findFirst.mockResolvedValue({ user: demoUser });

    const result = await getAuthenticatedUserBySessionToken('raw-token');

    expect(result?.role.permissions).toEqual(['auth.login', 'admin.user.manage']);
    expect(result?.email).toBe('admin@poli.edu.co');
  });

  it('revokeSession revoca sesión activa', async () => {
    mocks.mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });

    await revokeSession('raw-token');

    expect(mocks.hashSessionTokenMock).toHaveBeenCalledWith('raw-token');
    expect(mocks.mockPrisma.session.updateMany).toHaveBeenCalledWith({
      where: {
        token: 'hashed-raw-token',
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date),
      },
    });
  });
});
