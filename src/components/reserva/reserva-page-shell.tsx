'use client';
 
import { useState } from 'react';
import ReservaForm from '@/components/reserva/reserva-form';
import ReservaSummaryList from '@/components/reserva/reserva-summary-list';
 
interface ReservaPageShellProps {
  user: any;
}
 
export default function ReservaPageShell({ user }: ReservaPageShellProps) {
  const [selectedHorario, setSelectedHorario] = useState('');
  const [selectedPlaza, setSelectedPlaza] = useState('');
 
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
      <div>
        <div className="login-card">
          <ReservaForm
            user={user}
            selectedHorario={selectedHorario}
            selectedPlaza={selectedPlaza}
            onSelectedHorarioChange={setSelectedHorario}
            onSelectedPlazaChange={setSelectedPlaza}
            onConfirmReserva={(_horario, _plaza) => {}}
          />
        </div>
      </div>
 
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <ReservaSummaryList />
 
        <article className="login-card">
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-text-muted)', margin: 0 }}>Instrucciones</p>
          <h3 style={{ margin: '0.75rem 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ep-text)' }}>¿Cómo reservar?</h3>
          <ol style={{ margin: '1rem 0 0', paddingLeft: '1.5rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Selecciona tu horario de clase disponible',
              'Consulta las plazas disponibles en el mapa',
              'Selecciona una plaza y confirma la reserva',
              'Recibirás confirmación en tu correo',
            ].map((texto, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--ep-brand)', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>{texto}</span>
              </li>
            ))}
          </ol>
        </article>
 
        <article className="login-card" style={{ backgroundColor: 'var(--ep-text)', color: 'white' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ep-brand-light)', margin: 0 }}>Tu perfil</p>
          <dl style={{ margin: '1.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <dt style={{ color: 'var(--ep-text-muted)', fontSize: '0.875rem' }}>Nombre</dt>
              <dd style={{ margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 500 }}>{user.name}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--ep-text-muted)', fontSize: '0.875rem' }}>Rol</dt>
              <dd style={{ margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 500 }}>{user.role.name}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--ep-text-muted)', fontSize: '0.875rem' }}>Estado</dt>
              <dd style={{ margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 500 }}>{user.estadoCuenta}</dd>
            </div>
            {user.parqueoPermanente && (
              <div>
                <dt style={{ color: 'var(--ep-text-muted)', fontSize: '0.875rem' }}>Parqueo</dt>
                <dd style={{ margin: '0.25rem 0 0', display: 'inline-flex', alignItems: 'center', borderRadius: '999px', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a7f3d0' }}>
                  Permanente
                </dd>
              </div>
            )}
          </dl>
        </article>
 
        <article className="login-card">
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-text-muted)', margin: 0 }}>Estados de plazas</p>
          <div style={{ margin: '1rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { color: '#f0fdf4', border: '#16a34a', label: 'Disponible' },
              { color: '#fffbeb', border: '#d97706', label: 'Reservada'  },
              { color: '#f8fafc', border: '#64748b', label: 'Ocupada'    },
              { color: '#fef2f2', border: '#dc2626', label: 'Bloqueada'  },
            ].map(({ color, border, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: color, border: `2px solid ${border}`, flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>{label}</span>
              </div>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}