'use client';

import { useState } from 'react';
import PlazaCard from '@/components/celador/PlazaCard';

type EstadoPlaza = 'DISPONIBLE' | 'RESERVADA' | 'OCUPADA' | 'BLOQUEADA';

type Plaza = {
  id: string;
  zona: string;
  fila: string;
  numero: number;
  estado: EstadoPlaza;
  tipo: string;
  bloqueoTemporalHasta: Date | null;
};

type Filtro = 'TODAS' | EstadoPlaza;

export default function PlazaGrid({ plazas }: { plazas: Plaza[] }) {
  const [filtro, setFiltro] = useState<Filtro>('TODAS');

  const plazasFiltradas = filtro === 'TODAS'
    ? plazas
    : plazas.filter(p => p.estado === filtro);

  const zonas = plazasFiltradas.reduce<Record<string, Plaza[]>>((acc, plaza) => {
    if (!acc[plaza.zona]) acc[plaza.zona] = [];
    acc[plaza.zona].push(plaza);
    return acc;
  }, {});

  const filtros: { label: string; valor: Filtro }[] = [
    { label: 'Todas', valor: 'TODAS' },
    { label: 'Disponibles', valor: 'DISPONIBLE' },
    { label: 'Ocupadas', valor: 'OCUPADA' },
    { label: 'Reservadas', valor: 'RESERVADA' },
    { label: 'Bloqueadas', valor: 'BLOQUEADA' },
  ];

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {filtros.map(({ label, valor }) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid var(--ep-line)',
              backgroundColor: filtro === valor ? 'var(--ep-brand)' : 'white',
              color: filtro === valor ? 'white' : 'var(--ep-text)',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { color: '#16a34a', label: 'Disponible' },
          { color: '#dc2626', label: 'Ocupada' },
          { color: '#d97706', label: 'Reservada' },
          { color: '#64748b', label: 'Bloqueada' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--ep-text)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>

      {/* Plazas vacías */}
      {plazasFiltradas.length === 0 && (
        <p style={{ color: 'var(--ep-text-muted)', fontSize: '0.9rem' }}>
          No hay plazas con el filtro seleccionado.
        </p>
      )}

      {/* Grid por zonas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.entries(zonas).map(([zona, plazasZona]) => (
          <section key={zona}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--ep-text)' }}>
                Zona {zona}
              </h2>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                borderRadius: '999px', backgroundColor: 'var(--ep-line)', color: 'var(--ep-text-soft)'
              }}>
                {plazasZona.length} plazas
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {plazasZona.map(plaza => (
                <PlazaCard key={plaza.id} plaza={plaza} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}