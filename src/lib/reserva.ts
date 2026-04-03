// Modelo de Reserva de Plaza
// Cambios: Nuevo archivo, gestiona las reservas de plazas con validación de conflictos y automatización

import { PrismaClient, EstadoReserva } from '@prisma/client';
import { PlazaParqueo } from './plaza-parqueo';

const prisma = new PrismaClient();

export class Reserva {
  constructor(
    public id: string,
    public idUsuario: string,
    public idPlaza: string,
    public fechaHoraInicio: Date,
    public fechaHoraFin: Date,
    public estado: EstadoReserva,
    public fechaCreacion: Date,
    public metodoPago?: string
  ) {}

  // Método común: consultarReserva
  async consultarReserva(): Promise<any> {
    return await prisma.reserva.findUnique({
      where: { id: this.id },
      include: {
        usuario: true,
        plaza: true,
      },
    });
  }

  // Método común: cancelarReserva
  async cancelarReserva(): Promise<void> {
    if (this.estado !== EstadoReserva.ACTIVA) {
      throw new Error('La reserva no puede ser cancelada');
    }

    await prisma.reserva.update({
      where: { id: this.id },
      data: { estado: EstadoReserva.CANCELADA },
    });

    // Liberar la plaza
    const plaza = await PlazaParqueo.findById(this.idPlaza);
    if (plaza) {
      await plaza.liberar();
    }

    this.estado = EstadoReserva.CANCELADA;
  }

  // Método común: extender
  async extender(tiempoAdicional: number): Promise<void> {
    if (this.estado !== EstadoReserva.ACTIVA) {
      throw new Error('La reserva no puede ser extendida');
    }

    const nuevaFin = new Date(this.fechaHoraFin.getTime() + tiempoAdicional);

    await prisma.reserva.update({
      where: { id: this.id },
      data: {
        fechaHoraFin: nuevaFin,
        estado: EstadoReserva.EXTENDIDA,
      },
    });

    this.fechaHoraFin = nuevaFin;
    this.estado = EstadoReserva.EXTENDIDA;
  }

  // Método común: validarHorarioAcademico
  async validarHorarioAcademico(): Promise<boolean> {
    // Lógica para validar que la reserva coincide con horario académico
    // Esto requeriría consultar la tabla Horario
    // Por simplicidad, retornar true por ahora
    return true;
  }

  // Método específico: crearReserva
  static async crearReserva(
    idUsuario: string,
    idPlaza: string,
    fechaHoraInicio: Date,
    fechaHoraFin: Date,
    metodoPago?: string
  ): Promise<Reserva> {
    // Validar que no haya duplicada
    const existente = await prisma.reserva.findFirst({
      where: {
        idUsuario,
        idPlaza,
        fechaHoraInicio: {
          gte: fechaHoraInicio,
          lt: fechaHoraFin,
        },
        estado: EstadoReserva.ACTIVA,
      },
    });

    if (existente) {
      throw new Error('Ya existe una reserva activa para este usuario y plaza en este horario');
    }

    const reserva = await prisma.reserva.create({
      data: {
        idUsuario,
        idPlaza,
        fechaHoraInicio,
        fechaHoraFin,
        metodoPago,
      },
    });

    // Reservar la plaza
    const plaza = await PlazaParqueo.findById(idPlaza);
    if (plaza) {
      await plaza.reservar(reserva.id);
    }

    return Reserva.fromDB(reserva);
  }

  // Método específico: validarNoDuplicada
  static async validarNoDuplicada(
    idUsuario: string,
    idPlaza: string,
    fechaHoraInicio: Date,
    fechaHoraFin: Date
  ): Promise<boolean> {
    const count = await prisma.reserva.count({
      where: {
        idUsuario,
        idPlaza,
        OR: [
          {
            fechaHoraInicio: { lte: fechaHoraInicio },
            fechaHoraFin: { gt: fechaHoraInicio },
          },
          {
            fechaHoraInicio: { lt: fechaHoraFin },
            fechaHoraFin: { gte: fechaHoraFin },
          },
          {
            fechaHoraInicio: { gte: fechaHoraInicio },
            fechaHoraFin: { lte: fechaHoraFin },
          },
        ],
        estado: EstadoReserva.ACTIVA,
      },
    });

    return count === 0;
  }

  // Método específico: programarNotificaciones
  async programarNotificaciones(): Promise<void> {
    // Lógica para programar notificaciones (por ejemplo, recordatorios)
    // Esto podría involucrar un sistema de colas o cron jobs
    console.log(`Programando notificaciones para reserva ${this.id}`);
  }

  // Método específico: emitirEventoReservaCreada
  async emitirEventoReservaCreada(): Promise<void> {
    // Lógica para emitir eventos (por ejemplo, a un bus de eventos)
    console.log(`Emitiendo evento de reserva creada: ${this.id}`);
  }

  // Propiedad calculada: tiempoRestante
  get tiempoRestante(): number {
    return Math.max(0, this.fechaHoraFin.getTime() - Date.now());
  }

  // Método estático para crear desde DB
  static fromDB(data: any): Reserva {
    return new Reserva(
      data.id,
      data.idUsuario,
      data.idPlaza,
      data.fechaHoraInicio,
      data.fechaHoraFin,
      data.estado,
      data.fechaCreacion,
      data.metodoPago
    );
  }

  // Método estático para buscar por ID
  static async findById(id: string): Promise<Reserva | null> {
    const data = await prisma.reserva.findUnique({
      where: { id },
    });

    return data ? Reserva.fromDB(data) : null;
  }

  // Método estático para buscar reservas activas de un usuario
  static async findActivasByUsuario(idUsuario: string): Promise<Reserva[]> {
    const data = await prisma.reserva.findMany({
      where: {
        idUsuario,
        estado: EstadoReserva.ACTIVA,
      },
    });

    return data.map(Reserva.fromDB);
  }
}