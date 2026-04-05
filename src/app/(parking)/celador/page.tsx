import { requirePermission } from '@/server/auth/guards';
import { obtenerTodasLasPlazas, desbloquearPlazasExpiradas } from '@/server/plazas/service';
import PlazaGrid from '@/components/celador/PlazaGrid';

export default async function CeladorPage() {
  const user = await requirePermission('parking.slot.manage.assign', '/dashboard');

  await desbloquearPlazasExpiradas();

  const plazas = await obtenerTodasLasPlazas();

  const disponibles = plazas.filter(p => p.estado === 'DISPONIBLE').length;
  const ocupadas = plazas.filter(p => p.estado === 'OCUPADA').length;
  const reservadas = plazas.filter(p => p.estado === 'RESERVADA').length;
  const bloqueadas = plazas.filter(p => p.estado === 'BLOQUEADA').length;

  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <header className="login-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ep-brand)', margin: 0 }}>
              Panel de celador
            </p>
            <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--ep-text)' }}>
              Gestión de plazas
            </h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: 'var(--ep-text-soft)' }}>
              {user.name} — {user.email}
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              Cerrar sesión
            </button>
          </form>
        </header>

        {/* Contadores */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Disponibles', valor: disponibles, color: '#16a34a' },
            { label: 'Ocupadas', valor: ocupadas, color: '#dc2626' },
            { label: 'Reservadas', valor: reservadas, color: '#d97706' },
            { label: 'Bloqueadas', valor: bloqueadas, color: '#64748b' },
            { label: 'Total', valor: plazas.length, color: 'black' },
          ].map(({ label, valor, color }) => (
            <div key={label} className="login-card" style={{ textAlign: 'center', padding: '1rem', borderTop: `4px solid ${color}` }}>
              <p style={{ fontSize: '2rem', fontWeight: 900, color, margin: 0 }}>{valor}</p>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ep-text-soft)', margin: '0.25rem 0 0' }}>{label}</p>
            </div>
          ))}
        </section>

        {/* Mapa */}
        <div className="login-card" style={{ padding: '1.5rem' }}>
          <PlazaGrid plazas={plazas} />
        </div>

      </div>
    </main>
  );
}