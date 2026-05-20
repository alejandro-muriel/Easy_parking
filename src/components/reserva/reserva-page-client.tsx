'use client';
 
import { useState } from 'react';
import ReservaForm from '@/components/reserva/reserva-form';
import ReservaSummaryList from '@/components/reserva/reserva-summary-list';
import ReservaActivaList from '@/components/reserva/reserva-activa-list';
 
interface ReservaPageClientProps {
  user: any;
}
 
export default function ReservaPageClient({ user }: ReservaPageClientProps) {
  const [selectedHorario, setSelectedHorario] = useState('');
  const [selectedPlaza, setSelectedPlaza] = useState('');
 
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--ep-surface-soft)', padding: '2rem 1rem' }}>
      {/* Encabezado */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-brand)' }}>
          Parquea Fácil
        </p>
        <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--ep-text)' }}>
          Reservar plaza de parqueo
        </h1>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--ep-text-soft)', fontSize: '0.95rem' }}>
          Vincula tu reserva con tu horario académico y elige una plaza disponible.
        </p>
      </div>
 
      {/* Layout: formulario + sidebar */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Formulario */}
        <ReservaForm
          user={user}
          selectedHorario={selectedHorario}
          selectedPlaza={selectedPlaza}
          onSelectedHorarioChange={setSelectedHorario}
          onSelectedPlazaChange={setSelectedPlaza}
        />
 
        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1.5rem' }}>
          <ReservaSummaryList />
 
          {/* Instrucciones */}
          <article className="login-card">
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-text-muted)', margin: 0 }}>
              Instrucciones
            </p>
            <h3 style={{ margin: '0.75rem 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--ep-text)' }}>
              ¿Cómo reservar?
            </h3>
            <ol style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--ep-text-soft)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              <li>Selecciona tu horario de clase disponible.</li>
              <li>Elige una plaza libre en el mapa.</li>
              <li>Confirma tu reserva y espera el correo de confirmación.</li>
            </ol>
          </article>
        </aside>
      </div>
 
      {/* Lista completa de reservas activas */}
      <div style={{ maxWidth: '1200px', margin: '1.5rem auto 0' }}>
        <ReservaActivaList />
      </div>
    </main>
  );
}