import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc,_#e2e8f0_45%,_#dcfce7)] px-6 py-12 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col justify-center gap-10 rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-emerald-100/80 backdrop-blur lg:p-14">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full bg-slate-950 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Parquea Fácil
          </p>
          <h1 className="mt-6 text-5xl font-black leading-tight sm:text-6xl">
            Gestión de acceso y reservas para el parqueadero universitario.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            La base del proyecto ya corre sobre Next.js, PostgreSQL y Prisma. F-01 incorpora autenticación con sesiones persistidas en base de datos y permisos por rol.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Probar login
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
