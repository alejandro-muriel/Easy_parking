// Página de Reserva de Plaza
// Implementa CU-02: Reservar plaza de parqueo
// Permite a usuarios reservar plazas vinculadas a su horario académico

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/guards';
import ReservaPageShell from '@/components/reserva/reserva-page-shell';
import { LogoutButton } from '@/components/auth/logout-button';
import { BotonCancelarReserva } from '@/components/reserva/boton-cancelar';
import { EstadoReserva } from '@prisma/client';
import Link from 'next/link';

interface ReservaPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReservaPage({ searchParams }: ReservaPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const error = params.error as string;
  const success = params.success as string;

  const reservasVigentes = await prisma.reserva.findMany({
    where: {
      idUsuario: user.id,
      estado: EstadoReserva.ACTIVA
    },
    include: {
      plaza: true
    }
  });

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

        <ReservaPageShell user={user} />

        <div className="login-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ep-text)' }}>
            Mis Reservas Vigentes (HU-06)
          </h2>
          
          {reservasVigentes.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)', margin: 0 }}>
              No tienes ninguna reserva activa en el sistema actualmente.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reservasVigentes.map((reserva) => (
                <div 
                  key={reserva.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    border: '1.5px solid var(--ep-line)', 
                    borderRadius: '8px',
                    backgroundColor: 'var(--ep-surface)' 
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--ep-text)' }}>
                      Plaza Seleccionada: Zona {reserva.plaza.zona} - Fila {reserva.plaza.fila} # {reserva.plaza.numero}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--ep-text-soft)' }}>
                      Válida desde: {new Date(reserva.fechaHoraInicio).toLocaleString('es-CO')}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ep-text-soft)' }}>
                      Hasta: {new Date(reserva.fechaHoraFin).toLocaleString('es-CO')}
                    </p>
                  </div>
                  
                  {/* Botón interactivo cliente */}
                  <BotonCancelarReserva reservaId={reserva.id} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
