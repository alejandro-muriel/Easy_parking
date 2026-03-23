'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type LoginState = {
  email: string;
  password: string;
};

const initialState: LoginState = {
  email: '',
  password: '',
};

export function LoginForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<LoginState>(initialState);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          Correo institucional
        </label>
        <input
          required
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
          placeholder="usuario@poli.edu.co"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          Contraseña
        </label>
        <input
          required
          id="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
          placeholder="Ingresa tu contraseña"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? 'Validando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
