import { useCallback, useEffect, useRef, useState } from 'react';

type NotificationEventType = 'RESERVA_EXTENDIDA' | 'RESERVA_CANCELADA';

type StartNotificationInput = {
  reservaId: string;
  eventType: NotificationEventType;
  delayMinutes: number;
  title: string;
  description: string;
};

type DeferredState = StartNotificationInput & {
  secondsLeft: number;
};

type UseDeferredNotificationResult = {
  pending: DeferredState | null;
  feedback: string;
  sending: boolean;
  clearFeedback: () => void;
  startNotification: (input: StartNotificationInput) => void;
  cancelNotification: () => void;
  sendNow: () => Promise<void>;
};

const FALLBACK_DELAY_MINUTES = 10;

function toSafeSeconds(delayMinutes: number) {
  const clampedMinutes = Math.min(15, Math.max(1, Math.round(delayMinutes || FALLBACK_DELAY_MINUTES)));
  return clampedMinutes * 60;
}

export function useDeferredNotification(): UseDeferredNotificationResult {
  const [pending, setPending] = useState<DeferredState | null>(null);
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const pendingRef = useRef<DeferredState | null>(null);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const clearFeedback = useCallback(() => {
    setFeedback('');
  }, []);

  const sendRequest = useCallback(async (trigger: 'TIMEOUT' | 'MANUAL') => {
    const current = pendingRef.current;
    if (!current) {
      return;
    }

    try {
      setSending(true);
      const response = await fetch('/api/notificaciones/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservaId: current.reservaId,
          eventType: current.eventType,
          trigger,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo enviar la notificación mock.');
      }

      setFeedback('Notificación mock enviada por SMS y email.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo enviar la notificación mock.';
      setFeedback(errorMessage);
    } finally {
      setSending(false);
      setPending(null);
      pendingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timer = window.setInterval(() => {
      setPending((prev) => {
        if (!prev) {
          return null;
        }

        if (prev.secondsLeft <= 1) {
          void sendRequest('TIMEOUT');
          return {
            ...prev,
            secondsLeft: 0,
          };
        }

        return {
          ...prev,
          secondsLeft: prev.secondsLeft - 1,
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [pending, sendRequest]);

  const startNotification = useCallback((input: StartNotificationInput) => {
    setFeedback('');
    setPending({
      ...input,
      secondsLeft: toSafeSeconds(input.delayMinutes),
    });
  }, []);

  const cancelNotification = useCallback(() => {
    setPending(null);
    pendingRef.current = null;
    setFeedback('Notificación SMS/email cancelada por el usuario.');
  }, []);

  const sendNow = useCallback(async () => {
    await sendRequest('MANUAL');
  }, [sendRequest]);

  return {
    pending,
    feedback,
    sending,
    clearFeedback,
    startNotification,
    cancelNotification,
    sendNow,
  };
}
