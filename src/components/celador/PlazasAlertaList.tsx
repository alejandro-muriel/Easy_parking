'use client';

import { useEffect, useState } from 'react';

interface ReservaAlerta {
  id: string;
  fechaHoraFin: string;
  plaza: {
    id: string;
    zona: string;
    fila: string;
    numero: number;
  };
  usuario: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PlazasAlertaList() {
  const [reservas, setReservas] = useState<ReservaAlerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);

  const consultarAlertas = async () => {
    try {
      const res = await fetch('/api/plazas/proximas-liberar');
      if (res.ok) {
        const data = await res.json();
        setReservas(data);
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    consultarAlertas();
    const interval = setInterval(consultarAlertas, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificarManual = async (reservaId: string, plazaNumero: number) => {
    setEnviandoId(reservaId);
    try {
      const res = await fetch('/api/notificaciones/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservaId,
          eventType: 'PLAZA_PROXIMA_VENCER',
          trigger: 'MANUAL',
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        alert(`¡Éxito! Notificación enviada al usuario de la plaza #${plazaNumero}.`);
      } else {
        alert(`Error: ${data.message || 'No se pudo enviar la notificación.'}`);
      }
    } catch (error) {
      console.error('Error al notificar:', error);
      alert('Ocurrió un error al intentar enviar la notificación.');
    } finally {
      setEnviandoId(null);
    }
  };

  if (loading) {
    return (
      <div className="login-card" style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--ep-text-soft)' }}>
        Buscando plazas ocupadas próximas a vencer...
      </div>
    );
  }

  return (
    <div className="login-card" style={{ padding: '1.5rem', borderTop: '4px solid #d97706' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626'}} />
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--ep-text)' }}>
          Plazas por vencer en 15 min
        </h2>
      </div>

      {reservas.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ep-text-soft)' }}>
          No hay plazas críticas que cumplan los criterios en este momento.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reservas.map((reserva) => {
            const minRestantes = Math.max(
              0,
              Math.round((new Date(reserva.fechaHoraFin).getTime() - Date.now()) / 60000)
            );

            return (
              <div 
                key={reserva.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem 1rem', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--ep-text)' }}>
                    Bloque {reserva.plaza.zona} — Fila {reserva.plaza.fila} — Plaza #{reserva.plaza.numero}
                  </p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--ep-text-soft)' }}>
                    Ocupante: {reserva.usuario.name} ({reserva.usuario.email})
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    Faltan {minRestantes} min
                  </span>
                  <button
                    onClick={() => handleNotificarManual(reserva.id, reserva.plaza.numero)}
                    disabled={enviandoId === reserva.id}
                    className="btn-primary"
                    style={{ 
                      width: 'auto', 
                      padding: '0.4rem 0.85rem', 
                      fontSize: '0.75rem',
                      backgroundColor: enviandoId === reserva.id ? '#94a3b8' : 'var(--ep-brand)'
                    }}
                  >
                    {enviandoId === reserva.id ? 'Enviando...' : 'Notificar manual'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}