import { NextRequest, NextResponse } from 'next/server';
import { revokeSession } from '@/server/auth/service';
import { clearSessionCookie, readSessionCookie } from '@/server/auth/session';

export async function POST(request: NextRequest) {
  const sessionToken = readSessionCookie(request.cookies);

  if (sessionToken) {
    await revokeSession(sessionToken);
  }

  const response = NextResponse.redirect(new URL('/login', request.url));
  clearSessionCookie(response.cookies);

  return response;
}