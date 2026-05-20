// src/app/reserva/page.tsx
// Server Component — autentica al usuario y renderiza la vista de reserva
 
import { requireAuth } from '@/server/auth/guards';
import ReservaPageClient from '@/components/reserva/reserva-page-client';
 
export default async function ReservaPage() {
  // Si no hay sesión, requireAuth redirige a /login automáticamente
  const user = await requireAuth();
 
  return <ReservaPageClient user={user} />;
}
