'use client';
 
import { useEffect, useState } from 'react';
 
interface HorarioResumen {
  id: string;
  materia: string;
  horaInicio: string;
  horaFin: string;
  diaSemana: string;
}
 
interface PlazaResumen {
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
  estado: string; // ACTIVA | EXTENDIDA (estado de la reserva, no de la plaza)
  plaza: PlazaResumen;
  horarioCompatible: boolean;
  horario: HorarioResumen | null;
}
 
// Tema visual basado en el estado de la PLAZA (no de la reserva)
const plazaEstadoTheme: Record<string, { bg: string; border: string; text: string; label: string }> = {
  RESERVADA:  { bg: '#fef3c7', border: '#f7d77c', text: '#92400e', label: 'Reservada' },
  OCUPADA:    { bg: '#f8fafc', border: '#cbd5e1', text: '#334155', label: 'Ocupada'   },
  BLOQUEADA:  { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', label: 'Bloqueada' },
  DISPONIBLE: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', label: 'Disponible'},
};
 
export default function ReservaSummaryList() {
  const [reservas, setReservas] = useState<ReservaActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  useEffect(() => { fetchReservas(); }, []);
 
  const fetchReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reservas');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error al cargar reservas');
      setReservas(Array.isArray(data.reservas) ? data.reservas : []);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };
 
  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
 
  // Reserva más reciente por fechaHoraInicio
  const reservaReciente = reservas.length > 0
    ? [...reservas].sort(
        (a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime()
      )[0]
    : null;
 
  // ⚡ CORRECCIÓN:
  // Si el usuario tiene una reserva activa sobre esta plaza, desde su perspectiva
  // la plaza está "Reservada" — sin importar lo que devuelva plaza.estado (la API
  // puede devolver DISPONIBLE si el flag de la tabla de plazas aún no se sincroniza
  // con la tabla de reservas). La existencia del registro de reserva es la fuente
  // de verdad para este componente.
  const theme = reservaReciente ? plazaEstadoTheme.RESERVADA : null;
 
  return (
    <article className="login-card">
      <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-text-muted)', margin: 0 }}>
        Reserva seleccionada
      </p>
      <h3 style={{ margin: '0.75rem 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ep-text)' }}>
        Resumen de tu reserva
      </h3>
 
      {/* Cargando */}
      {loading && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '1rem', backgroundColor: 'var(--ep-surface-soft)', color: 'var(--ep-text-soft)', fontSize: '0.9rem' }}>
          Cargando reserva…
        </div>
      )}
 
      {/* Error */}
      {!loading && error && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
 
      {/* Sin reservas vigentes — criterio HU */}
      {!loading && !error && !reservaReciente && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '1rem', backgroundColor: 'var(--ep-surface-soft)', color: 'var(--ep-text-soft)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          No tienes reservas vigentes. Selecciona un horario y una plaza para crear una.
        </div>
      )}
 
      {/* Reserva más reciente — badge "Reservada" */}
      {!loading && !error && reservaReciente && theme && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '1rem', border: `1px solid ${theme.border}`, backgroundColor: theme.bg }}>
 
            {/* Plaza + badge Reservada */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: theme.text, opacity: 0.75 }}>Plaza</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--ep-text)' }}>
                  Zona {reservaReciente.plaza.zona} • {reservaReciente.plaza.fila}{reservaReciente.plaza.numero}
                </p>
              </div>
 
              {/* Badge principal: siempre "Reservada" porque el usuario tiene la reserva */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px', backgroundColor: theme.border, color: theme.text }}>
                  {theme.label}
                </span>
 
                {/* Badge secundario opcional: distingue ACTIVA vs EXTENDIDA */}
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  backgroundColor: reservaReciente.estado?.toUpperCase() === 'EXTENDIDA' ? '#dbeafe' : '#dcfce7',
                  color: reservaReciente.estado?.toUpperCase() === 'EXTENDIDA' ? '#1e40af' : '#166534',
                }}>
                  {reservaReciente.estado?.toUpperCase() === 'EXTENDIDA' ? 'Extendida' : 'Activa'}
                </span>
              </div>
            </div>
 
            {/* Clase */}
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--ep-text-soft)' }}>Clase</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ep-text)' }}>
              {reservaReciente.horario?.materia ?? '—'}
            </p>
 
            {/* Horario */}
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--ep-text-soft)' }}>Horario</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ep-text)' }}>
              {reservaReciente.horario?.diaSemana ?? new Date(reservaReciente.fechaHoraInicio).toLocaleDateString('es', { weekday: 'long' })}
              {' • '}
              {formatHora(reservaReciente.fechaHoraInicio)} – {formatHora(reservaReciente.fechaHoraFin)}
            </p>
 
            {/* Compatibilidad horario */}
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: reservaReciente.horarioCompatible ? '#166534' : '#92400e' }}>
              {reservaReciente.horarioCompatible ? '✓ Compatible con tu horario' : '⚠ Sin horario vinculado'}
            </p>
          </div>
 
          {reservas.length > 1 && (
            <p style={{ margin: '0.6rem 0 0', fontSize: '0.75rem', color: 'var(--ep-text-muted)', textAlign: 'center' }}>
              +{reservas.length - 1} reserva{reservas.length - 1 > 1 ? 's' : ''} adicional{reservas.length - 1 > 1 ? 'es' : ''} — ver abajo
            </p>
          )}
        </div>
      )}
 
      {/* Botón actualizar */}
      {!loading && (
        <button
          type="button"
          onClick={fetchReservas}
          style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '999px', border: '1.5px solid var(--ep-line)', backgroundColor: 'var(--ep-surface-soft)', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--ep-text-soft)', cursor: 'pointer' }}
        >
          ↺ Actualizar
        </button>
      )}
    </article>
  );
}