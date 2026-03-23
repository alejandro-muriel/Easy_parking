import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { readSessionCookie } from '@/server/auth/session';
import { getAuthenticatedUserBySessionToken } from '@/server/auth/service';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = readSessionCookie(cookieStore);

  if (sessionToken) {
    const user = await getAuthenticatedUserBySessionToken(sessionToken);
    if (user) {
      redirect('/dashboard');
    }
  }

  const params = await searchParams;
  const redirectTo = params.from && params.from.startsWith('/') ? params.from : '/dashboard';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_28%),linear-gradient(135deg,_#f8fafc,_#ecfeff_40%,_#f8fafc)] px-6 py-12 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-emerald-100/60 lg:px-12 lg:py-14">
          <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Easy Parking
          </p>
          <h1 className="max-w-xl text-4xl font-black leading-tight sm:text-5xl">
            Controla el acceso al parqueadero con una base segura desde el primer sprint.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Esta primera entrega ya valida usuarios contra PostgreSQL, persiste sesiones en base de datos y resuelve permisos por rol para los flujos iniciales del sistema.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Roles</p>
              <p className="mt-2 text-3xl font-bold">6</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Permisos</p>
              <p className="mt-2 text-3xl font-bold">11</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Sesiones</p>
              <p className="mt-2 text-3xl font-bold">DB</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Inicio de sesión
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">Accede con tu cuenta institucional</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Usa una de las cuentas sembradas en la base para validar el flujo completo de autenticación.
              </p>
            </div>
            <LoginForm redirectTo={redirectTo} />
          </div>
        </section>
      </div>
    </main>
  );
}
