import { redirect } from 'next/navigation';
import { requireAuth } from '@/server/auth/guards';

export default async function HomePage() {
  await requireAuth('/login');
  redirect('/dashboard');
}
