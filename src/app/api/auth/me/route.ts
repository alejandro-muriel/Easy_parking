import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserBySessionToken } from '@/server/auth/service';
import { readSessionCookie } from '@/server/auth/session';

export async function GET(request: NextRequest) {
  const sessionToken = readSessionCookie(request.cookies);

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await getAuthenticatedUserBySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
