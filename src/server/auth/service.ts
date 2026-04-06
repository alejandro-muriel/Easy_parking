import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateSessionToken, getSessionExpiryDate, hashSessionToken } from './session';

type LoginInput = {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  estadoCuenta: string;
  parqueoPermanente: boolean;
  role: {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
  };
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function authenticateUser(input: LoginInput) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (!email || !password) {
    return { ok: false as const, status: 400, message: 'Email y contraseña son obligatorios.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return { ok: false as const, status: 401, message: 'Credenciales inválidas.' };
  }

  if (user.estadoCuenta !== 'ACTIVE') {
    return { ok: false as const, status: 403, message: 'La cuenta no está habilitada para iniciar sesión.' };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return { ok: false as const, status: 401, message: 'Credenciales inválidas.' };
  }

  const rawToken = generateSessionToken();
  const hashedToken = hashSessionToken(rawToken);
  const expiresAt = getSessionExpiryDate();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { ultimoLogin: new Date() },
    }),
    prisma.session.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    }),
  ]);

  return {
    ok: true as const,
    sessionToken: rawToken,
    expiresAt,
    user: mapAuthenticatedUser(user),
  };
}

export async function getAuthenticatedUserBySessionToken(sessionToken: string) {
  const hashedToken = hashSessionToken(sessionToken);

  const session = await prisma.session.findFirst({
    where: {
      token: hashedToken,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session || session.user.estadoCuenta !== 'ACTIVE') {
    return null;
  }

  return mapAuthenticatedUser(session.user);
}

export async function revokeSession(sessionToken: string) {
  const hashedToken = hashSessionToken(sessionToken);

  await prisma.session.updateMany({
    where: {
      token: hashedToken,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

function mapAuthenticatedUser(user: {
  id: string;
  email: string;
  name: string;
  estadoCuenta: string;
  parqueoPermanente: boolean;
  role: {
    id: string;
    name: string;
    description: string | null;
    rolePermissions: Array<{
      permission: {
        key: string;
      };
    }>;
  };
}): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    estadoCuenta: user.estadoCuenta,
    parqueoPermanente: user.parqueoPermanente,
    role: {
      id: user.role.id,
      name: user.role.name,
      description: user.role.description,
      permissions: user.role.rolePermissions.map((item) => item.permission.key),
    },
  };
}
