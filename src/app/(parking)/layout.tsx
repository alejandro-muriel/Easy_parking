import Image from 'next/image';
import { getSessionUser } from '@/server/auth/guards';

export default async function ParkingLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <>
      {user && (
        <nav style={{
          backgroundColor: 'var(--ep-surface)',
          borderBottom: '1px solid var(--ep-line)',
          padding: '0.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image src="/logo.png" alt="Logo Politécnico" width={75} height={75} style={{ objectFit: 'contain' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--ep-brand)' }}>
                Parquea Fácil
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--ep-text-muted)' }}>
                Sistema de Gestión de Parqueaderos
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {user.role.name === 'CELADOR' && (
              <a href="/celador" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ep-brand)', textDecoration: 'none' }}>
                🗺 Mapa
              </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ep-text)' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--ep-text-muted)' }}>
                {user.email}
              </span>
            </div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem',
              borderRadius: '999px', backgroundColor: 'var(--ep-brand)', color: 'white'
            }}>
              {user.role.name}
            </span>
          </div>
        </nav>
      )}
      {children}
    </>
  );
}