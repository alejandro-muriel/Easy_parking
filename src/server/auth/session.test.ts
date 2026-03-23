import {
  clearSessionCookie,
  generateSessionToken,
  getSessionExpiryDate,
  hashSessionToken,
  readSessionCookie,
  writeSessionCookie,
} from './session';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from './config';

describe('session utils', () => {
  it('genera token hexadecimal de 64 caracteres', () => {
    const token = generateSessionToken();

    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashea el token de forma determinística', () => {
    const token = 'token-123';

    const a = hashSessionToken(token);
    const b = hashSessionToken(token);

    expect(a).toBe(b);
    expect(a).not.toBe(token);
  });

  it('calcula expiración con duración configurada', () => {
    const before = Date.now();
    const expiresAt = getSessionExpiryDate();
    const delta = expiresAt.getTime() - before;

    expect(delta).toBeGreaterThanOrEqual(SESSION_DURATION_MS - 50);
    expect(delta).toBeLessThanOrEqual(SESSION_DURATION_MS + 50);
  });

  it('lee cookie de sesión cuando existe', () => {
    const cookieStore = {
      get: vi.fn().mockReturnValue({ value: 'my-token' }),
    };

    const token = readSessionCookie(cookieStore);

    expect(cookieStore.get).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(token).toBe('my-token');
  });

  it('devuelve null cuando no existe cookie de sesión', () => {
    const cookieStore = {
      get: vi.fn().mockReturnValue(undefined),
    };

    const token = readSessionCookie(cookieStore);

    expect(token).toBeNull();
  });

  it('escribe cookie de sesión con opciones seguras', () => {
    const cookieStore = { set: vi.fn() };
    const expiresAt = new Date('2030-01-01T00:00:00.000Z');

    writeSessionCookie(cookieStore, 'plain-token', expiresAt);

    expect(cookieStore.set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      'plain-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
      }),
    );
  });

  it('limpia cookie de sesión', () => {
    const cookieStore = { set: vi.fn() };

    clearSessionCookie(cookieStore);

    expect(cookieStore.set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      '',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });
});
