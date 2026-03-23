import { NextResponse } from 'next/server';
import { authenticateUser } from '@/server/auth/service';
import { writeSessionCookie } from '@/server/auth/session';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() ?? null;
    const userAgent = request.headers.get('user-agent');

    const result = await authenticateUser({
      email: body.email ?? '',
      password: body.password ?? '',
      ipAddress,
      userAgent,
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    const response = NextResponse.json(
      {
        user: result.user,
        redirectTo: '/dashboard',
      },
      { status: 200 },
    );

    writeSessionCookie(response.cookies, result.sessionToken, result.expiresAt);

    return response;
  } catch {
    return NextResponse.json(
      { message: 'No fue posible iniciar sesión en este momento.' },
      { status: 500 },
    );
  }
}
