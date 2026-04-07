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

        <section style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
          <article className="login-card" style={{ backgroundColor: 'var(--ep-surface-soft)', color: 'white' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ep-brand-light)', margin: 0 }}>Cuenta</p>
            <dl style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div>
                <dt style={{ color: 'var(--ep-text)', fontSize: '0.85rem' }}>Correo</dt>
                <dd style={{ color: 'var(--ep-text)', marginTop: '0.35rem', fontSize: '1rem', fontWeight: 600 }}>{user.email}</dd>
              </div>
              <div>
                <dt style={{ color: 'var(--ep-text)', fontSize: '0.85rem' }}>Estado</dt>
                <dd style={{ color: 'var(--ep-text)', marginTop: '0.35rem', fontSize: '1rem', fontWeight: 600 }}>{user.estadoCuenta}</dd>
              </div>
              <div>
                <dt style={{ color: 'var(--ep-text)', fontSize: '0.85rem' }}>Parqueo permanente</dt>
                <dd style={{ color: 'var(--ep-text)', marginTop: '0.35rem', fontSize: '1rem', fontWeight: 600 }}>
                  {user.parqueoPermanente ? 'Sí' : 'No'}
                </dd>
              </div>
            </dl>
          </article>

          <article>
            <div style={{ padding: 0 }}>
              <ReservaForm user={user} />
            </div>
          </article>
        </section>

      </div>
    </main>
  );
}
