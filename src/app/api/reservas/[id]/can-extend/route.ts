import { NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/guards';
import { canExtendReserva } from '@/server/reservas/extension-service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const result = await canExtendReserva(id, user.id);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error('Error validating extension:', error);
    return NextResponse.json(
      { ok: false, message: 'Error al validar la extensión.' },
      { status: 500 },
    );
  }
}
