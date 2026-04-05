'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const payload = (await response.json()) as { message?: string; redirectTo?: string };

      if (!response.ok) {
        setErrorMessage(payload.message ?? 'No fue posible iniciar sesión.');
        return;
      }

      router.push(payload.redirectTo ?? redirectTo);
      router.refresh();
    } catch {
      setErrorMessage('Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
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
        Demo: Usa tu cuenta institucional registrada para ingresar al sistema.
      </p>
    </form>
  );
}
