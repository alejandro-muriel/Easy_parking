// Dashboard - Panel de Usuario
// Cambios: Se agregó soporte para mensajes de éxito y se integró el formulario de reservas

import { LogoutButton } from '@/components/auth/logout-button';
import ReservaForm from '@/components/reserva/reserva-form';
import { requireAuth } from '@/server/auth/guards';
import styles from '@/app/dashboard/dashboard.module.css';


interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuth();
  const success = searchParams.success as string;

  return (
    <main className={`min-h-screen bg-slate-100 px-6 py-10 text-slate-950 ${styles.dashboardPage}`}>
      <div className={`mx-auto max-w-6xl ${styles.dashMain}`}>
        <div className={styles.dashContainer}>
          <header className={`flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between ${styles.dashHeader}`}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Panel inicial</p>
            <h1 className={`mt-3 text-4xl font-black ${styles.dashWelcome}`}>Hola, {user.name}</h1>
          </div>
          <div className={styles.dashHeaderActions}>
            <LogoutButton />
          </div>
          
        </header>

        {success && (
          <div className="mt-4 rounded-[2rem] bg-emerald-50 p-4 text-emerald-800">
            {success}
          </div>
        )}

        <section className={`mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] ${styles.dashGrid}`}>
          <article className={`rounded-[2rem] bg-slate-950 p-8 text-white shadow-lg ${styles.dashCard} ${styles.dashCardGold}`}>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Cuenta</p>
            <dl className={`mt-6 space-y-4 text-sm text-slate-300 ${styles.infoGrid}`}>
              <div className={styles.infoItem}>
                <dt className={`text-slate-400 ${styles.infoLabel}`}>Correo</dt>
                <dd className={`mt-1 text-base font-medium text-white ${styles.infoValue}`}>{user.email}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt className={`text-slate-400 ${styles.infoLabel}`}>Estado</dt>
                <dd className={`mt-1 text-base font-medium text-white ${styles.infoValue}`}>{user.estadoCuenta}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt className={`text-slate-400 ${styles.infoLabel}`}>Parqueo permanente</dt>
                <dd className={`mt-1 text-base font-medium text-white ${styles.infoValue}`}>
                  {user.parqueoPermanente ? 'Sí' : 'No'}
                </dd>
              </div>
            </dl>
          </article>
          <ReservaForm />
        </section>
        </div>
      </div>
    </main>
  );
}
