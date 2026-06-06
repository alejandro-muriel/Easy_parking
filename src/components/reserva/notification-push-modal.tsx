'use client';

type NotificationPushModalProps = {
  open: boolean;
  title: string;
  description: string;
  secondsLeft: number;
  sending: boolean;
  onClose: () => void;
  onSendNow: () => void;
};

function toClock(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function NotificationPushModal({
  open,
  title,
  description,
  secondsLeft,
  sending,
  onClose,
  onSendNow,
}: NotificationPushModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notificación pendiente"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        padding: '1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px', backgroundColor: 'white', borderRadius: '1rem', padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ep-text-muted)' }}>
            Notificación Push
          </p>
          <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.05rem', color: 'var(--ep-text)' }}>
            {title}
          </h3>
          <p style={{ margin: '0.6rem 0 0', fontSize: '0.9rem', color: 'var(--ep-text-soft)' }}>
            {description}
          </p>
        </div>

        <div style={{ borderRadius: '0.75rem', border: '1px solid var(--ep-line)', backgroundColor: 'var(--ep-surface-soft)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--ep-text)' }}>
            Envío automático SMS + email en:
          </span>
          <strong style={{ fontSize: '1rem', color: 'var(--ep-brand)' }}>{toClock(secondsLeft)}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            style={{ border: '1px solid var(--ep-line)', background: 'white', color: 'var(--ep-text)', borderRadius: '999px', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer' }}
          >
            Cerrar y cancelar envío
          </button>
          <button
            type="button"
            onClick={onSendNow}
            disabled={sending}
            style={{ border: 'none', background: 'var(--ep-brand)', color: 'white', borderRadius: '999px', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}
          >
            {sending ? 'Enviando...' : 'Enviar ahora'}
          </button>
        </div>
      </div>
    </div>
  );
}
