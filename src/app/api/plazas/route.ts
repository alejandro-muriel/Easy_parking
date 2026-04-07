// GET /api/plazas - Obtener plazas con filtros
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/guards';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(); // Validar que el usuario esté autenticado

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const zona = searchParams.get('zona');

    const where: any = {};
    if (estado) where.estado = estado;
    if (zona) where.zona = zona;

    const plazas = await prisma.plazaParqueo.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [
        { zona: 'asc' },
        { fila: 'asc' },
        { numero: 'asc' },
      ],
    });

    return NextResponse.json(plazas);
  } catch (error) {
    console.error('Error fetching plazas:', error);
    return NextResponse.json(
      { message: 'Error al obtener plazas' },
      { status: 500 }
    );
  }
}
