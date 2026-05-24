// HU-07: Liberación automática de plazas al vencer una reserva
// Criterios:
// - 5 min de espera si el usuario llegó (plaza estaba OCUPADA)
// - 10 min de espera si el usuario no llegó (plaza estaba RESERVADA)
// - Verifica cola FIFO antes de liberar

import { prisma } from '@/lib/prisma';
import { liberarPlaza, desbloquearPlazasExpiradas } from '@/server/plazas/service';
import { sendMockReservationNotification } from '@/server/notificaciones/mock-service';

const ESPERA_USUARIO_LLEGO_MS  = 5  * 60 * 1000; // 5 min  — plaza OCUPADA
const ESPERA_USUARIO_NO_LLEGO_MS = 10 * 60 * 1000; // 10 min — plaza RESERVADA

export type ResultadoLiberacion = {
  procesadas: number;
  liberadas:  number;
  errores:    string[];
  conCola:    string[]; // IDs de plazas que tienen cola FIFO activa
};

export async function liberarPlazasVencidas(): Promise<ResultadoLiberacion> {
  const ahora    = new Date();
  const errores: string[] = [];
  const conCola: string[] = [];
  let liberadas  = 0;

  // 1. Buscar reservas ACTIVAS o EXTENDIDAS cuya hora de fin ya pasó
  //    Incluimos la plaza para saber su estado actual
  const reservasVencidas = await prisma.reserva.findMany({
    where: {
      estado:       { in: ['ACTIVA', 'EXTENDIDA'] },
      fechaHoraFin: { lt: ahora },
    },
    include: { plaza: true, usuario: true },
  });

  for (const reserva of reservasVencidas) {
    const estadoPlaza = reserva.plaza.estado;

    // 2. Determinar cuánto tiempo debe haber pasado según si el usuario llegó
    //    OCUPADA  → el celador marcó que el vehículo llegó → 5 min
    //    RESERVADA → nunca llegó, inactividad              → 10 min
    const esperaMs =
      estadoPlaza === 'OCUPADA'
        ? ESPERA_USUARIO_LLEGO_MS
        : ESPERA_USUARIO_NO_LLEGO_MS;

    const tiempoTranscurrido = ahora.getTime() - new Date(reserva.fechaHoraFin).getTime();

    // 3. Si aún no pasó el tiempo de espera, esta reserva no se toca todavía
    if (tiempoTranscurrido < esperaMs) continue;

    try {
      // 4. Marcar la reserva como EXPIRADA en la base de datos
      await prisma.reserva.update({
        where: { id: reserva.id },
        data:  { estado: 'EXPIRADA' },
      });

      // 5. Liberar la plaza usando la función ya existente en plazas/service.ts
      //    Eso la pone en BLOQUEADA temporalmente 5 min, luego queda DISPONIBLE
      const resultado = await liberarPlaza(reserva.idPlaza);

      if (!resultado.ok) {
        errores.push(`Plaza ${reserva.idPlaza}: ${resultado.mensaje}`);
        continue;
      }

      liberadas++;

      const notificationResult = await sendMockReservationNotification({
        reservaId: reserva.id,
        eventType: 'RESERVA_EXPIRADA',
        trigger: 'SYSTEM',
      });

      if (!notificationResult.ok) {
        errores.push(`Reserva ${reserva.id}: ${notificationResult.message}`);
      }

      // 6. Revisar si hay alguien en la cola FIFO esperando esta plaza
      //    Usamos el modelo ColaEspera que creó el compa de HU-08
      const primeroEnCola = await prisma.colaEspera.findFirst({
        where: {
          idPlaza: reserva.idPlaza,
          estado:  'ACTIVA',
        },
        orderBy: { fechaRegistro: 'asc' }, // FIFO: el más antiguo primero
      });

      if (primeroEnCola) {
        conCola.push(reserva.idPlaza);
      }

    } catch {
      errores.push(`Reserva ${reserva.id}: error inesperado al liberar`);
    }
  }

  // 7. Desbloquear plazas cuyo bloqueo temporal de 5 min ya expiró
  //    Esto las pasa de BLOQUEADA a DISPONIBLE automáticamente
  await desbloquearPlazasExpiradas();

  return { procesadas: reservasVencidas.length, liberadas, errores, conCola };
}