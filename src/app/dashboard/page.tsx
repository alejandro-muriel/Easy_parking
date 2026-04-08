// Dashboard - Panel de Usuario
// Cambios: Se agregó soporte para mensajes de éxito y se integró el formulario de reservas

import { LogoutButton } from '@/components/auth/logout-button';
import ReservaForm from '@/components/reserva/reserva-form';
import { requireAuth } from '@/server/auth/guards';
import styles from '@/components/auth/logout-button.module.css'

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const success = params.success as string;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--ep-bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--ep-text)' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'white', margin: 0 }}>
              Easy Parking
            </p>
            <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>
              Hola, {user.name}
            </h1>
          </div>
          <div className={styles.dashHeaderActions}>
            <LogoutButton />
          </div>
        </header>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', paddingTop: '1.5rem', gap: '1.5rem' }}>
        

        {success && (
          <div className="login-card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            {success}
          </div>
        )}

        <section style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'minmax(320px, 420px) 1fr' }}>
          <div style={{ display: 'grid', gap: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
            <article className="login-card" style={{ backgroundColor: 'var(--ep-surface-soft)', color: 'white', padding: '1.5rem' }}>
              <p style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ep-brand-light)', margin: 0, fontWeight: 600 }}>Cuenta</p>
              <dl style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ep-brand-light)' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <div>
                    <dt style={{ color: 'var(--ep-text)', fontSize: '0.85rem', margin: 0 }}>Correo</dt>
                    <dd style={{ color: 'var(--ep-text)', margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 600 }}>{user.email}</dd>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: user.estadoCuenta === 'activo' ? '#ef4444' : '#2d8a4e' }}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="m16 11 2 2 4-4"></path>
                  </svg>
                  <div>
                    <dt style={{ color: 'var(--ep-text)', fontSize: '0.85rem', margin: 0 }}>Estado</dt>
                    <dd style={{ color: user.estadoCuenta === 'activo' ? '#ef4444' : '#2d8a4e', margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 600 }}>{user.estadoCuenta}</dd>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: user.parqueoPermanente ? '#10b981' : '#6b7280' }}>
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                    <circle cx="7" cy="17" r="2"></circle>
                    <path d="M9 17h6"></path>
                    <circle cx="17" cy="17" r="2"></circle>
                  </svg>
                  <div>
                    <dt style={{ color: 'var(--ep-text)', fontSize: '0.85rem', margin: 0 }}>Parqueo permanente</dt>
                    <dd style={{ color: user.parqueoPermanente ? '#10b981' : '#6b7280', margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 600 }}>
                      {user.parqueoPermanente ? 'Sí' : 'No'}
                    </dd>
                  </div>
                </div>
              </dl>
            </article>

            <article className="login-card" style={{ backgroundColor: '#14532d', color: 'white', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem' }}>
              <p style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, opacity: 0.9 }}>Compartir espacio</p>
              <p style={{ margin: '0.8rem 0 0', fontSize: '0.95rem', lineHeight: 1.6, color: '#d1fae5' }}>
                Priorizamos espacios para quienes mantienen compromisos de investigación y docencia presencial. Si tienes un espacio de parqueo permanente, considera compartirlo con la comunidad. ¡Juntos optimizamos el uso de los recursos y fomentamos la colaboración en el campus!
              </p>
            </article>
          </div>

          <article style={{  }}>
            <div style={{ padding: 0 }}>
              <ReservaForm user={user} />
            </div>
          </article>
        </section>

      </div>
    </main>
  );
}
