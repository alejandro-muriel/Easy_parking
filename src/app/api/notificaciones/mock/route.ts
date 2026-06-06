import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/guards';
import { sendMockReservationNotification } from '@/server/notificaciones/mock-service';

type NotificationEvent = 'RESERVA_EXTENDIDA' | 'RESERVA_CANCELADA';

type NotificationRequestBody = {
  reservaId?: string;
  eventType?: NotificationEvent;
  trigger?: 'TIMEOUT' | 'MANUAL';
};

const ALLOWED_EVENTS = new Set<NotificationEvent>(['RESERVA_EXTENDIDA', 'RESERVA_CANCELADA']);

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = (await request.json()) as NotificationRequestBody;

    const reservaId = body.reservaId?.trim();
    const eventType = body.eventType;
    const trigger = body.trigger === 'MANUAL' ? 'MANUAL' : 'TIMEOUT';

    if (!reservaId || !eventType || !ALLOWED_EVENTS.has(eventType)) {
      return NextResponse.json(
        { ok: false, message: 'Solicitud de notificacion invalida.' },
        { status: 400 },
      );
    }

    const result = await sendMockReservationNotification({
      reservaId,
      eventType,
      actorUserId: user.id,
      trigger,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: result.message }, { status: 200 });
  } catch (error) {
    console.error('Error enviando notificacion mock:', error);
    return NextResponse.json(
      { ok: false, message: 'Error interno enviando notificacion mock.' },
      { status: 500 },
    );
  }
}
