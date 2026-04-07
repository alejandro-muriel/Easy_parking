// Página de Reserva de Plaza
// Implementa CU-02: Reservar plaza de parqueo
// Permite a usuarios reservar plazas vinculadas a su horario académico

import { requireAuth } from '@/server/auth/guards';
import ReservaForm from '@/components/reserva/reserva-form';
import { LogoutButton } from '@/components/auth/logout-button';
import Link from 'next/link';

interface ReservaPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReservaPage({ searchParams }: ReservaPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const error = params.error as string;
  const success = params.success as string;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--ep-bg)', padding: '2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <header className="login-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-brand)', margin: 0 }}>
              Reservar Plaza
            </p>
            <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--ep-text)' }}>
              Reserva tu plaza de parqueo
            </h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: 'var(--ep-text-soft)' }}>
              Selecciona una plaza disponible vinculada a tu horario académico. El sistema valida automáticamente que la reserva no tenga conflictos con tus clases.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href="/dashboard"
              style={{ padding: '0.5rem 1rem', borderRadius: '999px', border: '1.5px solid var(--ep-line)', backgroundColor: 'var(--ep-surface)', color: 'var(--ep-text)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s' }}
            >
              Volver
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* Mensajes de estado */}
        {error && (
          <div className="login-card" style={{ backgroundColor: '#fff1f2', borderColor: '#fecdd3', color: '#be123c' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>Error</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {success && (
          <div className="login-card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>✓ Éxito</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{success}</p>
          </div>
        )}

        {/* Formulario y información */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          {/* Panel principal - Formulario */}
          <div>
            <div className="login-card">
              <ReservaForm user={user} />
            </div>
          </div>

          {/* Panel lateral - Información */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Instrucciones */}
            <article className="login-card">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-text-muted)', margin: 0 }}>Instrucciones</p>
              <h3 style={{ margin: '0.75rem 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ep-text)' }}>¿Cómo reservar?</h3>
              <ol style={{ margin: '1rem 0 0', paddingLeft: '1.5rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--ep-brand)', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>Selecciona tu horario de clase disponible</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--ep-brand)', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>Consulta las plazas disponibles en el mapa</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--ep-brand)', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>Selecciona una plaza y confirma la reserva</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: 'var(--ep-brand)', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>4</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>Recibirás confirmación en tu correo</span>
                </li>
              </ol>
            </article>

            {/* Información del usuario */}
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

            {/* Leyenda de plazas */}
            <article className="login-card">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-text-muted)', margin: 0 }}>Estados de plazas</p>
              <div style={{ margin: '1rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#f0fdf4', border: '2px solid #16a34a' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>Disponible</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#fffbeb', border: '2px solid #d97706' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>Reservada</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#f8fafc', border: '2px solid #64748b' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>Ocupada</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#fef2f2', border: '2px solid #dc2626' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)' }}>Bloqueada</span>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
