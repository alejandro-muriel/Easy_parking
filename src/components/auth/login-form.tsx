'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const PROFILES = [
  { label: 'Estudiante',     email: 'estudiante@poli.edu.co' },
  { label: 'Docente',        email: 'docente@poli.edu.co' },
  { label: 'Administrativo', email: 'admin@poli.edu.co' },
  { label: 'Directivo',      email: 'admin@poli.edu.co' },
  { label: 'Celador',        email: 'celador@poli.edu.co' },
  { label: 'Administrador',  email: 'admin@poli.edu.co' },
];

export function LoginForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const router = useRouter();
  const [profile, setProfile]   = useState(PROFILES[0].label);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleProfileChange(value: string) {
    setProfile(value);
    const found = PROFILES.find((p) => p.label === value);
    if (found) setEmail(found.email);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setErrorMessage(payload.message ?? 'No fue posible iniciar sesión.');
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMessage('Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {/* Perfil de usuario */}
      <div className="form-group">
        <label className="form-label" htmlFor="profile">
          Perfil de Usuario
        </label>
        <div className="select-wrapper">
          <select
            id="profile"
            value={profile}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="form-select"
          >
            {PROFILES.map((p) => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
          <span className="select-chevron" aria-hidden="true">&#8964;</span>
        </div>
      </div>

      {/* Correo institucional */}
      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Correo Institucional
        </label>
        <input
          required
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          placeholder="usuario@poli.edu.co"
        />
      </div>

      {/* Contraseña */}
      <div className="form-group">
        <label className="form-label" htmlFor="password">
          Contraseña
        </label>
        <input
          required
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          placeholder="••••••••"
        />
      </div>

      {errorMessage ? (
        <p className="form-error">{errorMessage}</p>
      ) : null}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Validando...' : 'Ingresar al Sistema'}
      </button>

      <p className="login-demo-note">
        Demo: Puedes ingresar con cualquier perfil para ver los mockups
      </p>
    </form>
  );
}
