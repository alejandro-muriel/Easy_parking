// POST /api/reservas - Crear reserva
// Implementa CU-02: Validación y creación de reservas

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/guards';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { horarioId, plazaId } = body;

    if (!horarioId || !plazaId) {
      return NextResponse.json(
        { message: 'Debe proporcionar horarioId y plazaId' },
        { status: 400 }
      );
    }

    // 1. Obtener horario
    const horario = await prisma.horario.findUnique({
      where: { id: horarioId },
    });

    if (!horario) {
      return NextResponse.json(
        { message: 'Horario no válido' },
        { status: 404 }
      );
    }

    // Validar que el horario pertenezca al usuario
    if (horario.idUsuario !== user.id) {
      return NextResponse.json(
        { message: 'El horario no pertenece al usuario' },
        { status: 403 }
      );
    }

    // 2. Obtener plaza
    const plaza = await prisma.plazaParqueo.findUnique({
      where: { id: plazaId },
    });

    if (!plaza) {
      return NextResponse.json(
        { message: 'Plaza no válida' },
        { status: 404 }
      );
    }

    // Validar que la plaza esté disponible
    if (plaza.estado !== 'DISPONIBLE') {
      return NextResponse.json(
        { message: 'La plaza no está disponible' },
        { status: 409 }
      );
    }

    // 3. Calcular fechas de la reserva basado en el horario
    const ahora = new Date();
    const diaActual = ahora.toLocaleString('es', { weekday: 'long' }).toLowerCase();
    const diaHorario = horario.diaSemana.toLowerCase();

    let fechaReserva = new Date(ahora);
    
    if (diaActual !== diaHorario) {
      // Calcular el próximo día de clase
      const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const indiceActual = dias.indexOf(diaActual);
      const indiceHorario = dias.indexOf(diaHorario);
      let diasHasta = indiceHorario - indiceActual;
      if (diasHasta <= 0) diasHasta += 7;
      fechaReserva.setDate(ahora.getDate() + diasHasta);
    }

    // Establecer la hora de inicio de la reserva según el horario académico
    const fechaHoraInicio = new Date(fechaReserva);
    fechaHoraInicio.setHours(horario.horaInicio.getHours(), horario.horaInicio.getMinutes(), 0, 0);

    // Establecer la hora de fin
    const fechaHoraFin = new Date(fechaReserva);
    fechaHoraFin.setHours(horario.horaFin.getHours(), horario.horaFin.getMinutes(), 0, 0);

    // 4. Validar que no exista reserva duplicada para el usuario en el mismo horario
    const reservaExistente = await prisma.reserva.findFirst({
      where: {
        idUsuario: user.id,
        idPlaza: plazaId,
        estado: { in: ['ACTIVA', 'EXTENDIDA'] },
        fechaHoraInicio: {
          gte: new Date(fechaReserva.getTime() - 24 * 60 * 60 * 1000),
          lt: new Date(fechaReserva.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (reservaExistente) {
      return NextResponse.json(
        { message: 'Ya tienes una reserva en esta plaza para este día' },
        { status: 409 }
      );
    }

    // 5. Crear la reserva dentro de una transacción
    const reserva = await prisma.$transaction(async (tx) => {
      // Crear reserva
      const newReserva = await tx.reserva.create({
        data: {
          idUsuario: user.id,
          idPlaza: plazaId,
          fechaHoraInicio,
          fechaHoraFin,
          estado: 'ACTIVA',
          metodoPago: 'ACADEMICA', // Por defecto, dentro del horario académico
        },
      });

      // Actualizar estado de la plaza a RESERVADA
      await tx.plazaParqueo.update({
        where: { id: plazaId },
        data: {
          estado: 'RESERVADA',
          ultimoCambio: new Date(),
        },
      });

      return newReserva;
    });

    // TODO: Enviar confirmación por correo al usuario

    return NextResponse.json(
      {
        message: 'Reserva creada exitosamente',
        reserva,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating reserva:', error);
    return NextResponse.json(
      { message: 'Error al crear la reserva' },
      { status: 500 }
    );
  }
}

// GET /api/reservas - Listar reservas activas del usuario y validar compatibilidad con su horario
export async function GET() {
  try {
    const user = await requireAuth();

    const reservas = await prisma.reserva.findMany({
      where: {
        idUsuario: user.id,
        estado: { in: ['ACTIVA', 'EXTENDIDA'] },
      },
      include: { plaza: true },
      orderBy: { fechaHoraInicio: 'asc' },
    });

    if (!reservas || reservas.length === 0) {
      return NextResponse.json(
        { message: 'No tiene reservas vigentes', reservas: [] },
        { status: 200 }
      );
    }

    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    const resultado = await Promise.all(
      reservas.map(async (r) => {
        const fechaInicio = new Date(r.fechaHoraInicio);
        const fechaFin = new Date(r.fechaHoraFin);
        const dia = dias[fechaInicio.getDay()];

        // Buscar un horario del usuario para el mismo día
        const horario = await prisma.horario.findFirst({
          where: {
            idUsuario: user.id,
            diaSemana: dia,
          },
        });

        let horarioCompatible = false;
        let horarioInfo = null;

        if (horario) {
          const rStartMin = fechaInicio.getHours() * 60 + fechaInicio.getMinutes();
          const rEndMin = fechaFin.getHours() * 60 + fechaFin.getMinutes();

          const hStartMin = horario.horaInicio.getHours() * 60 + horario.horaInicio.getMinutes();
          const hEndMin = horario.horaFin.getHours() * 60 + horario.horaFin.getMinutes();

          horarioCompatible = rStartMin >= hStartMin && rEndMin <= hEndMin;

          if (horarioCompatible) {
            horarioInfo = {
              id: horario.id,
              materia: horario.materia,
              horaInicio: horario.horaInicio,
              horaFin: horario.horaFin,
              diaSemana: horario.diaSemana,
            };
          }
        }

        return {
          id: r.id,
          fechaHoraInicio: r.fechaHoraInicio,
          fechaHoraFin: r.fechaHoraFin,
          estado: r.estado,
          plaza: r.plaza,
          horarioCompatible,
          horario: horarioInfo,
        };
      })
    );

    return NextResponse.json({ reservas: resultado }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reservas:', error);
    return NextResponse.json(
      { message: 'Error al obtener reservas' },
      { status: 500 }
    );
  }
}
