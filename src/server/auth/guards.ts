import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readSessionCookie } from '@/server/auth/session';
import { getAuthenticatedUserBySessionToken, type AuthenticatedUser } from '@/server/auth/service';

/**
 * Retorna el usuario autenticado desde un Server Component.
 * Si no hay sesión válida, redirige a /login.
 */
export async function requireAuth(redirectTo = '/login'): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  const sessionToken = readSessionCookie(cookieStore);

  if (!sessionToken) {
    redirect(redirectTo);
  }

  const user = await getAuthenticatedUserBySessionToken(sessionToken);

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Retorna el usuario autenticado o null, sin redirigir.
 * Útil para layouts que necesitan saber si hay sesión pero no deben bloquear.
 */
export async function getSessionUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionToken = readSessionCookie(cookieStore);

  if (!sessionToken) {
    return null;
  }

  return getAuthenticatedUserBySessionToken(sessionToken);
}

/**
 * Comprueba si el usuario tiene un permiso específico.
 */
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  return user.role.permissions.includes(permission);
}

/**
 * Comprueba si el usuario tiene alguno de los permisos indicados.
 */
export function hasAnyPermission(user: AuthenticatedUser, permissions: string[]): boolean {
  return permissions.some((p) => user.role.permissions.includes(p));
}

/**
 * Comprueba si el usuario tiene todos los permisos indicados.
 */
export function hasAllPermissions(user: AuthenticatedUser, permissions: string[]): boolean {
  return permissions.every((p) => user.role.permissions.includes(p));
}

/**
 * Comprueba si el usuario tiene el rol indicado.
 */
export function hasRole(user: AuthenticatedUser, role: string): boolean {
  return user.role.name === role;
}

/**
 * Usa requireAuth + comprueba permiso.
 * Si el usuario no tiene el permiso redirige a /dashboard.
 */
export async function requirePermission(
  permission: string,
  redirectTo = '/dashboard',
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!hasPermission(user, permission)) {
    redirect(redirectTo);
  }

  return user;
}
