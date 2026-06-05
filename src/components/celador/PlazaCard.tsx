'use client';

import { useState, useEffect } from 'react';
import {
  accionAsignarPlaza,
  accionLiberarPlaza,
  accionBloquearPlaza,
  accionDesbloquearPlaza,
} from '@/server/plazas/actions';

type EstadoPlaza = 'DISPONIBLE' | 'RESERVADA' | 'OCUPADA' | 'BLOQUEADA';

type Reserva = {
  id: string;
  fechaHoraFin: Date;
};

type Plaza = {
  id: string;
  zona: string;
  fila: string;
  numero: number;
  estado: EstadoPlaza;
  tipo: string;
  bloqueoTemporalHasta: Date | null;
  reservas: Reserva[];
};

const ESTILOS: Record<EstadoPlaza, { border: string; bg: string; color: string; icono: string }> = {
  DISPONIBLE: { border: '#16a34a', bg: '#f0fdf4', color: '#16a34a', icono: '✓' },
  RESERVADA:  { border: '#d97706', bg: '#fffbeb', color: '#d97706', icono: '⏱' },
  OCUPADA:    { border: '#dc2626', bg: '#fef2f2', color: '#dc2626', icono: '✕' },
  BLOQUEADA:  { border: '#94a3b8', bg: '#f8fafc', color: '#64748b', icono: '⊘' },
};

function formatearTiempoRestante(ms: number): string {
  if (ms <= 0) return '0 min';
  const horas = Math.floor(ms / (1000 * 60 * 60));
  const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (horas > 0) return `${horas}h ${minutos}m`;
  return `${minutos} min`;
}

export default function PlazaCard({ plaza }: { plaza: Plaza }) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const est = ESTILOS[plaza.estado];

  const reservaActiva = plaza.reservas.length > 0 ? plaza.reservas[0] : null;

  useEffect(() => {
    if (!reservaActiva || (plaza.estado !== 'OCUPADA' && plaza.estado !== 'RESERVADA')) {
      setTiempoRestante(null);
      return;
    }

    const actualizar = () => {
      const ahora = Date.now();
      const fin = new Date(reservaActiva.fechaHoraFin).getTime();
      const restante = Math.max(0, fin - ahora);
      setTiempoRestante(restante);
    };

    actualizar();
    const intervalo = setInterval(actualizar, 1000);
    return () => clearInterval(intervalo);
  }, [reservaActiva, plaza.estado]);

  async function ejecutar(accion: () => Promise<{ ok: boolean; mensaje: string }>) {
    setCargando(true);
    setMensaje(null);
    const resultado = await accion();
    setMensaje(resultado.mensaje);
    setCargando(false);
  }

  return (
    <div style={{
      border: `2px solid ${est.border}`,
      backgroundColor: est.bg,
      borderRadius: '0.75rem',
      padding: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      overflow: 'hidden',
      minWidth: 0,
    }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ep-text)' }}>
          {plaza.zona}-{plaza.fila}{plaza.numero}
        </span>
        <span style={{ fontSize: '1rem', color: est.color, fontWeight: 700 }}>{est.icono}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, color: est.color,
          textTransform: 'uppercase', flex: 1,
        }}>
          {plaza.estado}
        </span>
        <span style={{
          fontSize: '0.65rem', fontWeight: 600,
          padding: '0.1rem',
          borderRadius: '999px',
          backgroundColor: 'var(--ep-line)',
          color: 'var(--ep-text-soft)',
          whiteSpace: 'nowrap',
          marginRight: '0.25rem',
        }}>
          {plaza.tipo}
        </span>
      </div>

      {plaza.estado === 'BLOQUEADA' && plaza.bloqueoTemporalHasta && (
        <p style={{ fontSize: '0.7rem', color: 'var(--ep-text-muted)', margin: 0 }}>
          Libre aprox. {new Date(plaza.bloqueoTemporalHasta).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      {(plaza.estado === 'OCUPADA' || plaza.estado === 'RESERVADA') && tiempoRestante !== null && (
        <p style={{ fontSize: '0.7rem', color: 'var(--ep-text-muted)', margin: 0 }}>
          ⏱ Disponible en: {formatearTiempoRestante(tiempoRestante)}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
        {plaza.estado === 'DISPONIBLE' && (
          <>
            <button onClick={() => ejecutar(() => accionAsignarPlaza(plaza.id))} disabled={cargando} className="btn-primary"
              style={{ width: 'auto', padding: '0.3rem 0.75rem', fontSize: '0.75rem', marginTop: 0 }}>
              {cargando ? '...' : 'Asignar'}
            </button>
            <button onClick={() => ejecutar(() => accionBloquearPlaza(plaza.id))} disabled={cargando}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '0.4rem', border: '1.5px solid #94a3b8', background: 'white', color: '#64748b', cursor: 'pointer' }}>
              {cargando ? '...' : 'Bloquear'}
            </button>
          </>
        )}
        {(plaza.estado === 'OCUPADA' || plaza.estado === 'RESERVADA') && (
          <button onClick={() => ejecutar(() => accionLiberarPlaza(plaza.id))} disabled={cargando}
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '0.4rem', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer' }}>
            {cargando ? '...' : 'Liberar'}
          </button>
        )}
        {plaza.estado === 'BLOQUEADA' && (
          <button onClick={() => ejecutar(() => accionDesbloquearPlaza(plaza.id))} disabled={cargando}
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '0.4rem', border: 'none', background: 'var(--ep-brand)', color: 'white', cursor: 'pointer' }}>
            {cargando ? '...' : 'Desbloquear'}
          </button>
        )}
      </div>

      {mensaje && (
        <p style={{ fontSize: '0.7rem', color: 'var(--ep-text)', borderTop: '1px solid var(--ep-line)', paddingTop: '0.35rem', margin: 0 }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}