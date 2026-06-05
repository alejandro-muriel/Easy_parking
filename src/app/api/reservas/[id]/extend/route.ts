import { NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/guards';
import { extendReserva } from '@/server/reservas/extension-service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const result = await extendReserva(id, user.id);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error('Error extending reserva:', error);
    return NextResponse.json(
      { ok: false, message: 'Error al extender la reserva.' },
      { status: 500 },
    );
  }
}
