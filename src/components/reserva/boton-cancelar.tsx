'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPushModal from '@/components/reserva/notification-push-modal';
import { useDeferredNotification } from '@/hooks/use-deferred-notification';

interface BotonCancelarProps {
  reservaId: string;
}

export function BotonCancelarReserva({ reservaId }: BotonCancelarProps) {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const router = useRouter();
  const {
    pending,
    feedback,
    sending,
    clearFeedback,
    startNotification,
    cancelNotification,
    sendNow,
  } = useDeferredNotification();

  const manejarCancelacion = async () => {
    const confirmar = confirm('¿Estás seguro de que deseas cancelar esta reserva de parqueo?');
    if (!confirmar) return;

    setCargando(true);
    clearFeedback();
    setMensaje('');

    try {
      const respuesta = await fetch('/api/reservas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservaId }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(datos.message || 'Reserva cancelada correctamente.');
        if (datos.notification?.reservaId) {
          startNotification({
            reservaId: datos.notification.reservaId,
            eventType: datos.notification.eventType,
            delayMinutes: datos.notification.delayMinutes,
            title: 'Reserva cancelada',
            description:
              'Cierra esta notificación para cancelar el envío de SMS y email. Si no interactúas, se enviarán automáticamente al finalizar el contador.',
          });
        }

        router.refresh();
      } else {
        setMensaje(datos.message || 'No fue posible cancelar la reserva.');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor de parqueo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gap: '0.5rem', justifyItems: 'end' }}>
        <button
          onClick={manejarCancelacion}
          disabled={cargando}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
        >
          {cargando ? 'Cancelando...' : 'Cancelar Reserva'}
        </button>

        {mensaje && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ep-text-soft)', maxWidth: '320px', textAlign: 'right' }}>
            {mensaje}
          </p>
        )}

        {feedback && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#1d4ed8', maxWidth: '320px', textAlign: 'right' }}>
            {feedback}
          </p>
        )}
      </div>

      <NotificationPushModal
        open={Boolean(pending)}
        title={pending?.title ?? ''}
        description={pending?.description ?? ''}
        secondsLeft={pending?.secondsLeft ?? 0}
        sending={sending}
        onClose={cancelNotification}
        onSendNow={() => {
          void sendNow();
        }}
      />
    </>
  );
}