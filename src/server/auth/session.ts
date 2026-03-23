import { randomBytes, createHash } from 'node:crypto';
import type { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from './config';

export function generateSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export function readSessionCookie(cookieStore: Pick<RequestCookies, 'get'>) {
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function writeSessionCookie(cookieStore: Pick<ResponseCookies, 'set'>, token: string, expiresAt: Date) {
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(cookieStore: Pick<ResponseCookies, 'set'>) {
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
}
