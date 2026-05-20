import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/guards';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const cola = await prisma.colaEspera.findMany({
      where: {
        idPlaza: id,
        estado: 'ACTIVA',
      },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        fechaRegistro: 'asc',
      },
    });

    return NextResponse.json({ cola }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo cola de plaza:', error);
    return NextResponse.json({ message: 'Error al obtener cola de espera.' }, { status: 500 });
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const plaza = await prisma.plazaParqueo.findUnique({ where: { id } });

    if (!plaza) {
      return NextResponse.json({ message: 'Plaza no encontrada.' }, { status: 404 });
    }

    const existente = await prisma.colaEspera.findFirst({
      where: {
        idPlaza: id,
        idUsuario: user.id,
        estado: 'ACTIVA',
      },
    });

    if (existente) {
      return NextResponse.json({ message: 'Ya estás en la cola de esta plaza.' }, { status: 409 });
    }

    const entrada = await prisma.colaEspera.create({
      data: {
        idPlaza: id,
        idUsuario: user.id,
        estado: 'ACTIVA',
      },
    });

    return NextResponse.json({ message: 'Ingresaste a la cola de espera.', entrada }, { status: 201 });
  } catch (error) {
    console.error('Error creando entrada de cola:', error);
    return NextResponse.json({ message: 'Error al ingresar a la cola.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const salida = await prisma.colaEspera.updateMany({
      where: {
        idPlaza: id,
        idUsuario: user.id,
        estado: 'ACTIVA',
      },
      data: {
        estado: 'CANCELADA',
      },
    });

    if (salida.count === 0) {
      return NextResponse.json({ message: 'No tienes una entrada activa en esta cola.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Saliste de la cola de espera.' }, { status: 200 });
  } catch (error) {
    console.error('Error saliendo de cola:', error);
    return NextResponse.json({ message: 'Error al salir de la cola.' }, { status: 500 });
  }
}
