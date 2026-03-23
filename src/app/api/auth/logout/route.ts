import { NextRequest, NextResponse } from 'next/server';
import { revokeSession } from '@/server/auth/service';
import { clearSessionCookie, readSessionCookie } from '@/server/auth/session';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  const sessionToken = readSessionCookie(request.cookies);

  if (sessionToken) {
    await revokeSession(sessionToken);
  }

  clearSessionCookie(response.cookies);

  return response;
}
