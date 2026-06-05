// POST /api/reservas/liberar
// HU-07: Endpoint que dispara la liberación automática de plazas vencidas
// El frontend llama esto periódicamente (polling) para mantener
// el estado del parqueadero actualizado en tiempo real

import { NextResponse } from 'next/server';
import { liberarPlazasVencidas } from '@/server/reservas/liberar.service';

export async function POST() {
  try {
    const resultado = await liberarPlazasVencidas();

    return NextResponse.json(
      {
        message:    'Proceso de liberación ejecutado',
        procesadas: resultado.procesadas,
        liberadas:  resultado.liberadas,
        conCola:    resultado.conCola,
        errores:    resultado.errores,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en liberación automática:', error);
    return NextResponse.json(
      { message: 'Error al ejecutar liberación automática' },
      { status: 500 }
    );
  }
}