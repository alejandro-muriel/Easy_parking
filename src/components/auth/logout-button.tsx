'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Si logout remoto falla, forzamos cierre local de sesión en UI.
    } finally {
      router.push('/login');
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  );
}
