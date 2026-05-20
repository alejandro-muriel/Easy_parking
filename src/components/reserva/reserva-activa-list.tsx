'use client';
 
import { useEffect, useState } from 'react';
 
interface HorarioInfo {
  id: string;
  materia: string;
  horaInicio: string;
  horaFin: string;
  diaSemana: string;
}
 
interface PlazaInfo {
  id: string;
  zona: string;
  fila: string;
  numero: number;
  estado: string; // DISPONIBLE | RESERVADA | OCUPADA | BLOQUEADA
  tipo: string;
}
 
interface ReservaActiva {
  id: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: string; // ACTIVA | EXTENDIDA (estado de la reserva)
  extensionCount: number;
  totalExtendedMinutes: number;
  plaza: PlazaInfo;
  horarioCompatible: boolean;
  horario: HorarioInfo | null;
}

interface CanExtendResponse {
  ok: boolean;
  status: number;
  message: string;
  reserva?: {
    extensionMinutes: number;
    extensionCount: number;
    fechaHoraFin: string;
    nuevaFechaHoraFin: string;
  };
}
 
// Tema visual basado en el estado de la PLAZA
const plazaEstadoTheme: Record<string, { backgroundColor: string; borderColor: string; color: string; label: string }> = {
  RESERVADA:  { backgroundColor: '#fef3c7', borderColor: '#f7d77c', color: '#92400e', label: 'Reservada'  },
  OCUPADA:    { backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#334155', label: 'Ocupada'    },
  BLOQUEADA:  { backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b', label: 'Bloqueada'  },
  DISPONIBLE: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#166534', label: 'Disponible' },
};
 
const statusOrder = ['RESERVADA', 'OCUPADA', 'BLOQUEADA', 'DISPONIBLE'];
 
export default function ReservaActivaList() {
  const [reservas, setReservas] = useState<ReservaActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accionError, setAccionError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pendingExtension, setPendingExtension] = useState<{ reservaId: string; minutes: number } | null>(null);
 
  useEffect(() => { fetchReservas(); }, []);
 
  const fetchReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/reservas');
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'No se pudieron obtener las reservas');
      setReservas(Array.isArray(data.reservas) ? data.reservas : []);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleExtenderReserva = async (reservaId: string) => {
    setAccionError('');
    setProcessingId(reservaId);

    try {
      const canRes = await fetch(`/api/reservas/${reservaId}/can-extend`);
      const canData: CanExtendResponse = await canRes.json();

      if (!canRes.ok || !canData.ok) {
        throw new Error(canData.message || 'No fue posible validar la extensión.');
      }

      setPendingExtension({
        reservaId,
        minutes: canData.reserva?.extensionMinutes ?? 20,
      });
    } catch (err: any) {
      setAccionError(err?.message ?? 'Error al extender la reserva.');
    } finally {
      setProcessingId(null);
    }
  };

  const confirmarExtension = async () => {
    if (!pendingExtension) {
      return;
    }

    setAccionError('');
    setProcessingId(pendingExtension.reservaId);

    try {
      const extendRes = await fetch(`/api/reservas/${pendingExtension.reservaId}/extend`, {
        method: 'PATCH',
      });

      const extendData = await extendRes.json();

      if (!extendRes.ok || !extendData.ok) {
        throw new Error(extendData.message || 'No fue posible extender la reserva.');
      }

      setPendingExtension(null);
      await fetchReservas();
    } catch (err: any) {
      setAccionError(err?.message ?? 'Error al extender la reserva.');
    } finally {
      setProcessingId(null);
    }
  };
 
  // Agrupa reservas por estado de la PLAZA (no de la reserva)
  const groupedReservas = reservas.reduce<Record<string, ReservaActiva[]>>((acc, reserva) => {
    const key = reserva.plaza.estado?.toUpperCase() || 'DISPONIBLE';
    if (!acc[key]) acc[key] = [];
    acc[key].push(reserva);
    return acc;
  }, {});
 
  return (
    <article className="login-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ margin: 0, color: 'var(--ep-brand)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Estado de reservaciones
        </p>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--ep-text)' }}>
          Reservas y plazas por estado
        </h2>
        <p style={{ margin: 0, color: 'var(--ep-text-soft)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Tus plazas reservadas agrupadas por estado actual.
        </p>
      </header>
 
      {loading && (
        <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'var(--ep-surface-soft)', color: 'var(--ep-text-soft)' }}>
          Cargando estados de plazas...
        </div>
      )}
 
      {!loading && error && (
        <div style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}
 
      {!loading && !error && reservas.length === 0 && (
        <div style={{ padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'var(--ep-surface-soft)', color: 'var(--ep-text-soft)' }}>
          No tienes reservas activas registradas.
        </div>
      )}
 
      {!loading && !error && reservas.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {accionError && (
            <div style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b' }}>
              {accionError}
            </div>
          )}

          {/* Contadores — agrupados por estado de plaza */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
            {statusOrder.map((status) => {
              const items = groupedReservas[status] || [];
              const theme = plazaEstadoTheme[status];
              return (
                <section key={`counter-${status}`} style={{ padding: '1rem', borderRadius: '1rem', border: `1px solid ${theme.borderColor}`, backgroundColor: theme.backgroundColor }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.color }}>
                    {theme.label}
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: theme.color }}>
                    {items.length}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', color: theme.color, opacity: 0.8, fontSize: '0.8rem' }}>
                    plaza{items.length !== 1 ? 's' : ''}
                  </p>
                </section>
              );
            })}
          </div>
 
          {/* Detalle — solo muestra grupos con al menos 1 reserva */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
            {statusOrder.map((status) => {
              const items = groupedReservas[status] || [];
              if (items.length === 0) return null;
              const theme = plazaEstadoTheme[status];
              return (
                <section
                  key={`group-${status}`}
                  style={{ borderRadius: '1rem', border: `1px solid ${theme.borderColor}`, backgroundColor: theme.backgroundColor, padding: '1rem' }}
                >
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: theme.color }}>
                    {theme.label}
                  </p>
                  <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                    {items.slice(0, 9).map((reserva) => (
                      <div
                        key={reserva.id}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.8)' }}
                      >
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--ep-text)', fontSize: '0.9rem' }}>
                            Zona {reserva.plaza.zona} • {reserva.plaza.fila}{reserva.plaza.numero}
                          </span>
                          {reserva.horario && (
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--ep-text-muted)' }}>
                              {reserva.horario.materia}
                            </p>
                          )}
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--ep-text-muted)' }}>
                            Extensiones: {reserva.extensionCount} • Minutos: {reserva.totalExtendedMinutes}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px', backgroundColor: theme.borderColor, color: theme.color, whiteSpace: 'nowrap' }}>
                            {theme.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleExtenderReserva(reserva.id)}
                            disabled={processingId === reserva.id}
                            style={{
                              border: '1px solid var(--ep-line)',
                              background: 'var(--ep-surface)',
                              color: 'var(--ep-text)',
                              borderRadius: '999px',
                              padding: '0.25rem 0.6rem',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: processingId === reserva.id ? 'not-allowed' : 'pointer',
                              opacity: processingId === reserva.id ? 0.6 : 1,
                            }}
                          >
                            {processingId === reserva.id ? 'Procesando...' : 'Extender'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {pendingExtension && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar extensión"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'white', borderRadius: '1rem', padding: '1.25rem', display: 'grid', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ep-text-muted)' }}>
                Extensión de reserva
              </p>
              <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.1rem', color: 'var(--ep-text)' }}>
                Confirmar extensión
              </h3>
              <p style={{ margin: '0.6rem 0 0', fontSize: '0.9rem', color: 'var(--ep-text-soft)' }}>
                Tu reserva se extenderá por {pendingExtension.minutes} minutos adicionales.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setPendingExtension(null)}
                style={{ border: '1px solid var(--ep-line)', background: 'white', color: 'var(--ep-text)', borderRadius: '999px', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExtension}
                disabled={processingId === pendingExtension.reservaId}
                style={{ border: 'none', background: 'var(--ep-brand)', color: 'white', borderRadius: '999px', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: processingId === pendingExtension.reservaId ? 'not-allowed' : 'pointer', opacity: processingId === pendingExtension.reservaId ? 0.7 : 1 }}
              >
                {processingId === pendingExtension.reservaId ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}