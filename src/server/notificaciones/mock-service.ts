import { prisma } from '@/lib/prisma';

export type ReservationNotificationEvent = 'RESERVA_EXTENDIDA' | 'RESERVA_CANCELADA' | 'RESERVA_EXPIRADA';

type SendMockReservationNotificationInput = {
  reservaId: string;
  eventType: ReservationNotificationEvent;
  actorUserId?: string;
  trigger: 'TIMEOUT' | 'MANUAL' | 'SYSTEM';
};

type SendMockReservationNotificationResult = {
  ok: boolean;
  message: string;
};

function buildSubject(eventType: ReservationNotificationEvent) {
  switch (eventType) {
    case 'RESERVA_EXTENDIDA':
      return 'Confirmacion de extension de reserva';
    case 'RESERVA_CANCELADA':
      return 'Confirmacion de cancelacion de reserva';
    case 'RESERVA_EXPIRADA':
      return 'Notificacion de reserva expirada';
    default:
      return 'Notificacion de reserva';
  }
}

function buildBody(eventType: ReservationNotificationEvent, reservaId: string, trigger: SendMockReservationNotificationInput['trigger']) {
  switch (eventType) {
    case 'RESERVA_EXTENDIDA':
      return `Tu reserva ${reservaId} fue extendida correctamente. Disparador: ${trigger}.`;
    case 'RESERVA_CANCELADA':
      return `Tu reserva ${reservaId} fue cancelada correctamente. Disparador: ${trigger}.`;
    case 'RESERVA_EXPIRADA':
      return `Tu reserva ${reservaId} fue liberada por expiracion. Disparador: ${trigger}.`;
    default:
      return `Actualizacion registrada para reserva ${reservaId}. Disparador: ${trigger}.`;
  }
}

export async function sendMockReservationNotification(
  input: SendMockReservationNotificationInput,
): Promise<SendMockReservationNotificationResult> {
  const reserva = await prisma.reserva.findUnique({
    where: { id: input.reservaId },
    include: {
      usuario: true,
      plaza: true,
    },
  });

  if (!reserva) {
    return { ok: false, message: 'No se encontro la reserva para notificar.' };
  }

  if (input.actorUserId && reserva.idUsuario !== input.actorUserId) {
    return { ok: false, message: 'No autorizado para enviar notificacion de esta reserva.' };
  }

  const now = new Date().toISOString();
  const subject = buildSubject(input.eventType);
  const body = buildBody(input.eventType, reserva.id, input.trigger);

  console.log(
    `[NOTIFY_MOCK][SMS][${now}] to=user:${reserva.idUsuario} reserva=${reserva.id} event=${input.eventType} trigger=${input.trigger} body="${body}"`,
  );

  console.log(
    `[NOTIFY_MOCK][EMAIL][${now}] to=${reserva.usuario.email} reserva=${reserva.id} event=${input.eventType} trigger=${input.trigger} subject="${subject}" body="${body}"`,
  );

  return {
    ok: true,
    message: 'Notificaciones mock enviadas por SMS y email.',
  };
}
