// Formulario de Reserva
// Cambios: Nuevo componente, permite a usuarios reservar plazas de parqueo según su horario académico

import { Reserva } from '@/lib/reserva';
import { Horario } from '@/lib/horario';
import { PlazaParqueo } from '@/lib/plaza-parqueo';
import { requireAuth } from '@/server/auth/guards';
import { redirect } from 'next/navigation';
import styles from '@/app/dashboard/dashboard.module.css'

export default async function ReservaForm() {
  const user = await requireAuth();

  // Obtener horarios del usuario
  const horarios = await Horario.findByUsuario(user.id);

  // Obtener plazas disponibles
  const plazasDisponibles = await PlazaParqueo.findDisponibles();

  async function crearReserva(formData: FormData) {
    'use server';

    const user = await requireAuth();
    const horarioId = formData.get('horarioId') as string;
    const plazaId = formData.get('plazaId') as string;

    if (!horarioId || !plazaId) {
      throw new Error('Selecciona un horario y una plaza');
    }

    const horario = await Horario.findById(horarioId);
    if (!horario || horario.idUsuario !== user.id) {
      throw new Error('Horario no válido');
    }

    const plaza = await PlazaParqueo.findById(plazaId);
    if (!plaza || plaza.estado !== 'DISPONIBLE') {
      throw new Error('Plaza no disponible');
    }

    // Usar el horario académico para determinar fechaHoraInicio y fechaHoraFin
    // Asumir que la reserva es para hoy o el próximo día de clase
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

    const fechaHoraInicio = new Date(fechaReserva);
    fechaHoraInicio.setHours(horario.horaInicio.getHours(), horario.horaInicio.getMinutes());

    const fechaHoraFin = new Date(fechaReserva);
    fechaHoraFin.setHours(horario.horaFin.getHours(), horario.horaFin.getMinutes());

    // Validar disponibilidad
    const disponible = horario.validarDisponibilidadReserva(fechaHoraInicio, fechaHoraFin);
    if (!disponible) {
      throw new Error('Conflicto con horario académico');
    }

    // Crear reserva
    await Reserva.crearReserva(user.id, plazaId, fechaHoraInicio, fechaHoraFin);

    redirect('/dashboard?success=Reserva creada exitosamente');
  }

  return (
    <article className={`rounded-[2rem] bg-white p-8 shadow-sm ${styles.dashCard} ${styles.dashCardGold}`}>
      <p className={`text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 ${styles.dashCardTitle}`}>Reservar Plaza</p>
      <h2 className="mt-3 text-2xl font-bold">Reserva según horario académico</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Selecciona un horario de clase y una plaza disponible para reservar.
      </p>

      <form action={crearReserva} className="mt-6 space-y-4">
        <div>
          <label htmlFor="horarioId" className="block text-sm font-medium text-slate-700">
            Horario de clase
          </label>
          <select
            id="horarioId"
            name="horarioId"
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Selecciona un horario</option>
            {horarios.map((horario) => (
              <option key={horario.id} value={horario.id}>
                {horario.materia} - {horario.diaSemana} {horario.horaInicio.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} - {horario.horaFin.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="plazaId" className="block text-sm font-medium text-slate-700">
            Plaza disponible
          </label>
          <select
            id="plazaId"
            name="plazaId"
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Selecciona una plaza</option>
            {plazasDisponibles.map((plaza) => (
              <option key={plaza.id} value={plaza.id}>
                {plaza.zona}-{plaza.fila}{plaza.numero} ({plaza.tipo})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Reservar Plaza
        </button>
      </form>
    </article>
  );
}