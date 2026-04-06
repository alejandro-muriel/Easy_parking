'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/server/auth/guards';
import { asignarPlaza, liberarPlaza, bloquearPlaza, desbloquearPlaza } from '@/server/plazas/service';

export async function accionAsignarPlaza(plazaId: string) {
  await requirePermission('parking.slot.manage.assign', '/celador');
  const resultado = await asignarPlaza(plazaId);
  revalidatePath('/celador');
  return resultado;
}

export async function accionLiberarPlaza(plazaId: string) {
  await requirePermission('parking.slot.manage.release', '/celador');
  const resultado = await liberarPlaza(plazaId);
  revalidatePath('/celador');
  return resultado;
}

export async function accionBloquearPlaza(plazaId: string) {
  await requirePermission('parking.slot.manage.assign', '/celador');
  const resultado = await bloquearPlaza(plazaId);
  revalidatePath('/celador');
  return resultado;
}

export async function accionDesbloquearPlaza(plazaId: string) {
  await requirePermission('parking.slot.manage.release', '/celador');
  const resultado = await desbloquearPlaza(plazaId);
  revalidatePath('/celador');
  return resultado;
}