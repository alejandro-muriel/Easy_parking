// Modelo de Plaza de Parqueo
// Cambios: Nuevo archivo, gestiona el ciclo de vida de plazas (disponible, reservada, ocupada, bloqueada)

import { PrismaClient, EstadoPlaza, TipoPlaza } from '@prisma/client';

const prisma = new PrismaClient();

export class PlazaParqueo {
  constructor(
    public id: string,
    public zona: string,
    public fila: string,
    public numero: number,
    public estado: EstadoPlaza,
    public tipo: TipoPlaza,
    public ultimoCambio: Date,
    public bloqueoTemporalHasta?: Date,
    public capacidadVecina?: string
  ) {}

  // Método común: mostrarEstado
  mostrarEstado(): string {
    return `Plaza ${this.zona}-${this.fila}${this.numero}: ${this.estado}`;
  }

  // Método común: consultarTiempoRestante
  consultarTiempoRestante(): number | null {
    if (this.bloqueoTemporalHasta) {
      return Math.max(0, this.bloqueoTemporalHasta.getTime() - Date.now());
    }
    return null;
  }

  // Método específico: reservar
  async reservar(): Promise<void> {
    if (this.estado !== EstadoPlaza.DISPONIBLE) {
      throw new Error('La plaza no está disponible para reservar');
    }

    await prisma.plazaParqueo.update({
      where: { id: this.id },
      data: {
        estado: EstadoPlaza.RESERVADA,
        ultimoCambio: new Date(),
      },
    });

    this.estado = EstadoPlaza.RESERVADA;
    this.ultimoCambio = new Date();
  }

  // Método específico: liberar
  async liberar(): Promise<void> {
    await prisma.plazaParqueo.update({
      where: { id: this.id },
      data: {
        estado: EstadoPlaza.DISPONIBLE,
        ultimoCambio: new Date(),
        bloqueoTemporalHasta: null,
      },
    });

    this.estado = EstadoPlaza.DISPONIBLE;
    this.ultimoCambio = new Date();
    this.bloqueoTemporalHasta = undefined;
  }

  // Método específico: bloquearTemporal
  async bloquearTemporal(duracion: number): Promise<void> {
    const hasta = new Date(Date.now() + duracion);

    await prisma.plazaParqueo.update({
      where: { id: this.id },
      data: {
        estado: EstadoPlaza.BLOQUEADA,
        ultimoCambio: new Date(),
        bloqueoTemporalHasta: hasta,
      },
    });

    this.estado = EstadoPlaza.BLOQUEADA;
    this.ultimoCambio = new Date();
    this.bloqueoTemporalHasta = hasta;
  }

  // Método específico: marcarOcupada
  async marcarOcupada(): Promise<void> {
    await prisma.plazaParqueo.update({
      where: { id: this.id },
      data: {
        estado: EstadoPlaza.OCUPADA,
        ultimoCambio: new Date(),
      },
    });

    this.estado = EstadoPlaza.OCUPADA;
    this.ultimoCambio = new Date();
  }

  // Método específico: desbloquear
  async desbloquear(): Promise<void> {
    if (this.estado !== EstadoPlaza.BLOQUEADA) {
      throw new Error('La plaza no está bloqueada');
    }

    await prisma.plazaParqueo.update({
      where: { id: this.id },
      data: {
        estado: EstadoPlaza.DISPONIBLE,
        ultimoCambio: new Date(),
        bloqueoTemporalHasta: null,
      },
    });

    this.estado = EstadoPlaza.DISPONIBLE;
    this.ultimoCambio = new Date();
    this.bloqueoTemporalHasta = undefined;
  }

  // Método estático para crear desde DB
  static fromDB(data: any): PlazaParqueo {
    return new PlazaParqueo(
      data.id,
      data.zona,
      data.fila,
      data.numero,
      data.estado,
      data.tipo,
      data.ultimoCambio,
      data.bloqueoTemporalHasta,
      data.capacidadVecina
    );
  }

  // Método estático para buscar por ID
  static async findById(id: string): Promise<PlazaParqueo | null> {
    const data = await prisma.plazaParqueo.findUnique({
      where: { id },
    });

    return data ? PlazaParqueo.fromDB(data) : null;
  }

  // Método estático para buscar plazas disponibles
  static async findDisponibles(): Promise<PlazaParqueo[]> {
    const data = await prisma.plazaParqueo.findMany({
      where: { estado: EstadoPlaza.DISPONIBLE },
    });

    return data.map(PlazaParqueo.fromDB);
  }
}