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
    <main className="login-page">
      <div className="login-container">
        {/* Logo e identidad institucional */}
        <div className="login-header">
          <img
            src="/logo.png"
            alt="Politécnico Colombiano Jaime Isaza Cadavid"
            className="login-logo"
          />
          <p className="login-institution">POLITÉCNICO COLOMBIANO<br /><span>JAIME ISAZA CADAVID</span></p>
          <h1 className="login-title">Parquea Fácil</h1>
          <p className="login-subtitle">Sistema de Gestión de Parqueaderos</p>
        </div>

        {/* Tarjeta de login */}
        <div className="login-card">
          <h2 className="login-card-title">Iniciar Sesión</h2>
          <p className="login-card-subtitle">Accede con tus credenciales institucionales</p>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
