// GET /api/horarios - Obtener horarios del usuario
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/guards';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validar que el usuario solo vea sus propios horarios
    if (userId && userId !== user.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const horarios = await prisma.horario.findMany({
      where: {
        idUsuario: userId || user.id,
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' },
      ],
    });

    return NextResponse.json(horarios);
  } catch (error) {
    console.error('Error fetching horarios:', error);
    return NextResponse.json(
      { message: 'Error al obtener horarios' },
      { status: 500 }
    );
  }
}
