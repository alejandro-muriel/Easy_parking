import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasRole } from '@/server/auth/guards';

export async function GET() {
  try {
    const user = await requireAuth();

    if (!hasRole(user, 'CELADOR') && !hasRole(user, 'ADMINISTRADOR')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const ahora = new Date();
    const en15Minutos = new Date(ahora.getTime() + 15 * 60 * 1000);
    const haceUnaHora = new Date(ahora.getTime() - 60 * 60 * 1000);

    const reservasProximas = await prisma.reserva.findMany({
      where: {
        estado: 'ACTIVA', 
        fechaHoraFin: {
          gte: ahora,
          lte: en15Minutos,
        },
        fechaHoraInicio: {
          lte: haceUnaHora,
        },
      },
      include: {
        plaza: true,
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        fechaHoraFin: 'asc',
      },
    });

    return NextResponse.json(reservasProximas);
  } catch (error) {
    console.error('Error obteniendo plazas próximas a liberar:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}