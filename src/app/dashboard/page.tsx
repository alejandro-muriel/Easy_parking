// Dashboard - Panel de Usuario
// Cambios: Se agregó soporte para mensajes de éxito y se integró el formulario de reservas

import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import ReservaForm from '@/components/reserva/reserva-form';
import { requireAuth } from '@/server/auth/guards';

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const success = params.success as string;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--ep-bg)', padding: '2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <header className="login-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-brand)', margin: 0 }}>
              Panel inicial
            </p>
            <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--ep-text)' }}>
              Hola, {user.name}
            </h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: 'var(--ep-text-soft)', maxWidth: '680px', lineHeight: 1.6 }}>
              Sesión activa como <strong style={{ color: 'var(--ep-text)' }}>{user.role.name}</strong>. Este panel confirma que el flujo de autenticación ya consulta rol y permisos desde PostgreSQL.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LogoutButton />
          </div>
        </header>

        {success && (
          <div className="login-card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            {success}
          </div>
        )}

        <section style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
          <article className="login-card" style={{ backgroundColor: 'var(--ep-text)', color: 'white' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ep-brand-light)', margin: 0 }}>Cuenta</p>
            <dl style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div>
                <dt style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Correo</dt>
                <dd style={{ marginTop: '0.35rem', fontSize: '1rem', fontWeight: 600 }}>{user.email}</dd>
              </div>
              <div>
                <dt style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Estado</dt>
                <dd style={{ marginTop: '0.35rem', fontSize: '1rem', fontWeight: 600 }}>{user.estadoCuenta}</dd>
              </div>
              <div>
                <dt style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Parqueo permanente</dt>
                <dd style={{ marginTop: '0.35rem', fontSize: '1rem', fontWeight: 600 }}>
                  {user.parqueoPermanente ? 'Sí' : 'No'}
                </dd>
              </div>
            </dl>
          </article>

          <article className="login-card" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ep-text-muted)', margin: 0 }}>Reserva activa</p>
              <h2 style={{ margin: '0.75rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ep-text)' }}>Gestiona tus reservas</h2>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ep-text-soft)' }}>
                Mira tus reservas activas o verifica si no hay ninguna reserva vigente.
              </p>
            </div>
            <Link
              href="/reserva"
              style={{
                marginTop: '1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                backgroundColor: 'var(--ep-brand)',
                color: '#fff',
                borderRadius: 'var(--ep-radius-btn)',
                padding: '0.85rem 1rem',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              Ver reservas activas
            </Link>
          </article>
          <article className="login-card" style={{ padding: '1.5rem 1.75rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ep-text-muted)', margin: 0 }}>Permisos cargados</p>
            <h2 style={{ margin: '1rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ep-text)' }}>Matriz activa del rol {user.role.name}</h2>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ep-text-soft)' }}>
              Esta lista sale de la relación Role → RolePermission → Permission definida en Prisma.
            </p>
            <ul style={{ marginTop: '1.25rem', display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {user.role.permissions.map((permission) => (
                <li
                  key={permission}
                  style={{ borderRadius: '1rem', border: '1.5px solid var(--ep-line)', backgroundColor: 'var(--ep-surface)', padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ep-text)' }}
                >
                  {permission}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section>
          <div className="login-card" style={{ padding: 0 }}>
            <ReservaForm user={user} />
          </div>
        </section>
      </div>
    </main>
  );
}
