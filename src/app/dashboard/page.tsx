import { LogoutButton } from '@/components/auth/logout-button';
import { requireAuth } from '@/server/auth/guards';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Panel inicial</p>
            <h1 className="mt-3 text-4xl font-black">Hola, {user.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Sesión activa como <strong>{user.role.name}</strong>. Este panel confirma que el flujo de autenticación ya consulta rol y permisos desde PostgreSQL.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Cuenta</p>
            <dl className="mt-6 space-y-4 text-sm text-slate-300">
              <div>
                <dt className="text-slate-400">Correo</dt>
                <dd className="mt-1 text-base font-medium text-white">{user.email}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Estado</dt>
                <dd className="mt-1 text-base font-medium text-white">{user.estadoCuenta}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Parqueo permanente</dt>
                <dd className="mt-1 text-base font-medium text-white">
                  {user.parqueoPermanente ? 'Sí' : 'No'}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Permisos cargados</p>
            <h2 className="mt-3 text-2xl font-bold">Matriz activa del rol {user.role.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Esta lista sale de la relación Role → RolePermission → Permission definida en Prisma.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {user.role.permissions.map((permission) => (
                <li
                  key={permission}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {permission}
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
