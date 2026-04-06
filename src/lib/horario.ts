// Modelo de Horario Académico
// Cambios: Nuevo archivo, gestiona horarios de clase de usuarios con validaciones de disponibilidad

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Horario {
  constructor(
    public id: string,
    public materia: string,
    public horaInicio: Date,
    public horaFin: Date,
    public diaSemana: string,
    public idUsuario: string
  ) {}

  // Método común: consultarHorario
  async consultarHorario(): Promise<any> {
    return await prisma.horario.findUnique({
      where: { id: this.id },
      include: {
        usuario: true,
      },
    });
  }

  // Método común: obtenerIntervalos
  obtenerIntervalos(): { inicio: Date; fin: Date } {
    return {
      inicio: this.horaInicio,
      fin: this.horaFin,
    };
  }

  // Método específico: validarDisponibilidadReserva
  validarDisponibilidadReserva(inicio: Date, fin: Date): boolean {
    // Verificar si el horario de reserva se solapa con el horario académico
    const diaReserva = inicio.toLocaleString('es', { weekday: 'long' }).toLowerCase();
    const diaHorario = this.diaSemana.toLowerCase();

    if (diaReserva !== diaHorario) {
      return true; // No hay conflicto si es diferente día
    }

    // Verificar solapamiento de tiempo
    const inicioReserva = inicio.getHours() * 60 + inicio.getMinutes();
    const finReserva = fin.getHours() * 60 + fin.getMinutes();
    const inicioHorario = this.horaInicio.getHours() * 60 + this.horaInicio.getMinutes();
    const finHorario = this.horaFin.getHours() * 60 + this.horaFin.getMinutes();

    // Hay solapamiento si el inicio de la reserva está antes del fin del horario
    // y el fin de la reserva está después del inicio del horario
    return !(inicioReserva < finHorario && finReserva > inicioHorario);
  }

  // Método específico: obtenerProximasClases
  static async obtenerProximasClases(idUsuario: string, tiempoVentana: number): Promise<Horario[]> {
    const ahora = new Date();
    const ventanaFin = new Date(ahora.getTime() + tiempoVentana);

    const diaActual = ahora.toLocaleString('es', { weekday: 'long' }).toLowerCase();

    // Obtener horarios del día actual y próximos días dentro de la ventana
    const horarios = await prisma.horario.findMany({
      where: {
        idUsuario,
        diaSemana: {
          in: this.getDiasEnVentana(diaActual, tiempoVentana),
        },
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' },
      ],
    });

    return horarios
      .map(Horario.fromDB)
      .filter(horario => {
        // Filtrar solo clases que estén dentro de la ventana de tiempo
        const proximaClase = this.getProximaFechaClase(horario, ahora);
        return proximaClase <= ventanaFin;
      });
  }

  private static getDiasEnVentana(diaActual: string, tiempoVentana: number): string[] {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const indiceActual = dias.indexOf(diaActual);

    const diasEnVentana: string[] = [];
    const diasNecesarios = Math.ceil(tiempoVentana / (24 * 60 * 60 * 1000)); // días

    for (let i = 0; i <= diasNecesarios; i++) {
      diasEnVentana.push(dias[(indiceActual + i) % 7]);
    }

    return diasEnVentana;
  }

  private static getProximaFechaClase(horario: Horario, desde: Date): Date {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const indiceDiaHorario = dias.indexOf(horario.diaSemana.toLowerCase());
    const indiceDiaActual = dias.indexOf(desde.toLocaleString('es', { weekday: 'long' }).toLowerCase());

    let diasHastaProxima = indiceDiaHorario - indiceDiaActual;
    if (diasHastaProxima < 0) {
      diasHastaProxima += 7;
    }

    const proximaFecha = new Date(desde);
    proximaFecha.setDate(desde.getDate() + diasHastaProxima);
    proximaFecha.setHours(horario.horaInicio.getHours(), horario.horaInicio.getMinutes(), 0, 0);

    return proximaFecha;
  }

  // Método estático para crear desde DB
  static fromDB(data: any): Horario {
    return new Horario(
      data.id,
      data.materia,
      data.horaInicio,
      data.horaFin,
      data.diaSemana,
      data.idUsuario
    );
  }

  // Método estático para buscar por ID
  static async findById(id: string): Promise<Horario | null> {
    const data = await prisma.horario.findUnique({
      where: { id },
    });

    return data ? Horario.fromDB(data) : null;
  }

  // Método estático para buscar horarios de un usuario
  static async findByUsuario(idUsuario: string): Promise<Horario[]> {
    const data = await prisma.horario.findMany({
      where: { idUsuario },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' },
      ],
    });

    return data.map(Horario.fromDB);
  }

  // Método estático para crear horario
  static async crearHorario(
    materia: string,
    horaInicio: Date,
    horaFin: Date,
    diaSemana: string,
    idUsuario: string
  ): Promise<Horario> {
    const horario = await prisma.horario.create({
      data: {
        materia,
        horaInicio,
        horaFin,
        diaSemana,
        idUsuario,
      },
    });

    return Horario.fromDB(horario);
  }
}