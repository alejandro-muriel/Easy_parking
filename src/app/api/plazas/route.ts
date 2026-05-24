// GET /api/plazas - Obtener plazas con filtros
import { NextRequest, NextResponse } from 'next/server';
import { EstadoPlaza } from '@prisma/client';
import { requirePermission } from '@/server/auth/guards';
import { calcularStatsPlazas, obtenerPlazasMapa } from '@/server/plazas/service';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('parking.view.map', '/dashboard');

    const { searchParams } = new URL(request.url);
    const estadoParam = searchParams.get('estado');
    const zona = searchParams.get('zona');
    const includeStats = searchParams.get('includeStats') === 'true';

    let estado: EstadoPlaza | undefined;
    if (estadoParam) {
      const estadoNormalizado = estadoParam.toUpperCase();
      if (!Object.values(EstadoPlaza).includes(estadoNormalizado as EstadoPlaza)) {
        return NextResponse.json(
          { message: `Estado inválido: ${estadoParam}` },
          { status: 400 },
        );
      }
      estado = estadoNormalizado as EstadoPlaza;
    }

    const plazas = await obtenerPlazasMapa({
      estado,
      zona: zona ?? undefined,
    });

    if (includeStats) {
      return NextResponse.json({
        plazas,
        stats: calcularStatsPlazas(plazas),
      });
    }

    return NextResponse.json(plazas);
  } catch (error) {
    console.error('Error fetching plazas:', error);
    return NextResponse.json(
      { message: 'Error al obtener plazas' },
      { status: 500 }
    );
  }
}
