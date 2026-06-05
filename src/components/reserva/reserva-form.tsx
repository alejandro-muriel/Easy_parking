'use client';
 
// Formulario de Reserva - Componente Cliente
// Implementa CU-02: Reservar plaza de parqueo
// Permite seleccionar horario y plaza, con validación y confirmación
// Soporta uso "controlado" (parent maneja la selección vía props) o "no controlado" (estado interno).
 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReservaActivaList from '@/components/reserva/reserva-activa-list';
 
interface Horario {
  id: string;
  materia: string;
  horaInicio: string;
  horaFin: string;
  diaSemana: string;
}
 
interface Plaza {
  id: string;
  zona: string;
  fila: string;
  numero: number;
  estado: string;
  tipo: string;
}

interface ColaUsuario {
  id: string;
  name: string;
  email: string;
}

interface ColaEntry {
  id: string;
  idUsuario: string;
  idPlaza: string;
  estado: string;
  fechaRegistro: string;
  usuario: ColaUsuario;
}
 
interface ReservaFormProps {
  user: any;
  selectedHorario?: string;
  selectedPlaza?: string;
  onSelectedHorarioChange?: (horarioId: string) => void;
  onSelectedPlazaChange?: (plazaId: string) => void;
  onSelectedHorarioObjectChange?: (horario: Horario | null) => void;
  onSelectedPlazaObjectChange?: (plaza: Plaza | null) => void;
  onConfirmReserva?: (horario: Horario | null, plaza: Plaza | null) => void;
}
 
export default function ReservaForm({
  user,
  selectedHorario,
  selectedPlaza,
  onSelectedHorarioChange,
  onSelectedPlazaChange,
  onSelectedHorarioObjectChange,
  onSelectedPlazaObjectChange,
  onConfirmReserva,
}: ReservaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [plazas, setPlazas] = useState<Plaza[]>([]);
  const [queueMessage, setQueueMessage] = useState('');
  const [queueLoadingId, setQueueLoadingId] = useState<string | null>(null);
  const [queueMap, setQueueMap] = useState<Record<string, ColaEntry[]>>({});
 
  // Estado interno (fallback cuando el componente se usa sin props controlados)
  const [internalSelectedHorario, setInternalSelectedHorario] = useState('');
  const [internalSelectedPlaza, setInternalSelectedPlaza] = useState('');
 
  // Si el padre pasa props, ganan; si no, usamos el estado interno
  const currentSelectedHorario = selectedHorario ?? internalSelectedHorario;
  const currentSelectedPlaza = selectedPlaza ?? internalSelectedPlaza;
 
  // Cargar datos iniciales
  const loadInitialData = async () => {
    if (!user?.id) {
      setError('No se encontró usuario autenticado. Recarga la página.');
      return;
    }
 
    try {
      setLoading(true);
      const [horarioRes, plazasRes] = await Promise.all([
        fetch('/api/horarios'),
        fetch('/api/plazas'),
      ]);
 
      if (!horarioRes.ok || !plazasRes.ok) {
        throw new Error('Error al cargar datos');
      }
 
      const horariosData = await horarioRes.json();
      const plazasData = await plazasRes.json();
 
      setHorarios(horariosData);
      setPlazas(plazasData);

      const plazasNoDisponibles = (plazasData as Plaza[])
        .filter((plaza) => plaza.estado !== 'DISPONIBLE')
        .map((plaza) => plaza.id);

      if (plazasNoDisponibles.length > 0) {
        await Promise.all(plazasNoDisponibles.map((plazaId) => refreshQueue(plazaId)));
      }
    } catch (err) {
      setError('No pudimos cargar los datos. Recarga la página.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id]);
 
  // Manejo de cambios de horario
  const handleHorarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (onSelectedHorarioChange) {
      onSelectedHorarioChange(value);
    } else {
      setInternalSelectedHorario(value);
    }
    setError('');
  };
 
  // Manejo de cambios de plaza
  const handlePlazaChange = (_: React.MouseEvent<HTMLButtonElement>, plazaId: string) => {
    const newValue = currentSelectedPlaza === plazaId ? '' : plazaId;
    if (onSelectedPlazaChange) {
      onSelectedPlazaChange(newValue);
    } else {
      setInternalSelectedPlaza(newValue);
    }
    setError('');
  };
 
  const selectedHorarioObject = horarios.find((horario) => horario.id === currentSelectedHorario);
  const selectedPlazaObject = plazas.find((plaza) => plaza.id === currentSelectedPlaza);
 
  useEffect(() => {
    if (onSelectedHorarioObjectChange) {
      onSelectedHorarioObjectChange(selectedHorarioObject ?? null);
    }
  }, [selectedHorarioObject, onSelectedHorarioObjectChange]);
 
  useEffect(() => {
    if (onSelectedPlazaObjectChange) {
      onSelectedPlazaObjectChange(selectedPlazaObject ?? null);
    }
  }, [selectedPlazaObject, onSelectedPlazaObjectChange]);
 
  const plazasPorZona = plazas.reduce<Record<string, Plaza[]>>((acc, plaza) => {
    if (!acc[plaza.zona]) acc[plaza.zona] = [];
    acc[plaza.zona].push(plaza);
    return acc;
  }, {});

  const userRole = String(user?.role?.name ?? '').toUpperCase();
  const canUseQueue = userRole === 'ESTUDIANTE' || userRole === 'DOCENTE';

  const refreshQueue = async (plazaId: string) => {
    const response = await fetch(`/api/plazas/${plazaId}/cola`);

    if (!response.ok) {
      throw new Error('No se pudo cargar la cola de la plaza.');
    }

    const data = await response.json();
    const cola: ColaEntry[] = Array.isArray(data.cola) ? data.cola : [];

    setQueueMap((prev) => ({
      ...prev,
      [plazaId]: cola,
    }));

    return cola;
  };

  const handleQueueAction = async (plazaId: string) => {
    if (!canUseQueue) {
      setQueueMessage('Solo estudiantes y docentes pueden usar la cola de espera.');
      return;
    }

    setQueueMessage('');
    setQueueLoadingId(plazaId);

    try {
      const currentQueue = queueMap[plazaId] ?? [];
      const userInQueue = currentQueue.find((entry) => entry.idUsuario === user.id);

      const method = userInQueue ? 'DELETE' : 'POST';
      const actionRes = await fetch(`/api/plazas/${plazaId}/cola`, { method });
      const actionData = await actionRes.json();

      if (!actionRes.ok) {
        throw new Error(actionData?.message || 'No fue posible actualizar la cola.');
      }

      setQueueMessage(actionData?.message || 'Cola actualizada correctamente.');
      await refreshQueue(plazaId);
    } catch (err: any) {
      setQueueMessage(err?.message ?? 'Error al actualizar cola.');
    } finally {
      setQueueLoadingId(null);
    }
  };
 
  // Enviar reserva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!currentSelectedHorario || !currentSelectedPlaza) {
      setError('Selecciona un horario y una plaza');
      return;
    }
 
    try {
      setLoading(true);
      setError('');
 
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horarioId: currentSelectedHorario,
          plazaId: currentSelectedPlaza,
        }),
      });
 
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear reserva');
      }
 
      if (onConfirmReserva) {
        onConfirmReserva(selectedHorarioObject ?? null, selectedPlazaObject ?? null);
      }
 
      router.push('/dashboard?success=Reserva creada exitosamente! Verifica tu correo.');
    } catch (err: any) {
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Paso 1: Seleccionar Horario */}
      <article className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--ep-brand)', color: 'white', fontSize: '0.875rem', fontWeight: 700 }}>1</div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ep-text)', margin: 0 }}>Selecciona tu horario de clase</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)', margin: '0.25rem 0 0' }}>Elige un horario válido para que la reserva se vincule correctamente.</p>
          </div>
        </div>
 
        {error && (
          <div className="form-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}
 
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadInitialData}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '999px', border: '1.5px solid var(--ep-line)', backgroundColor: 'var(--ep-surface-soft)', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ep-text)', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            {loading ? 'Cargando...' : horarios.length > 0 ? 'Recargar horarios' : 'Cargar horarios'}
          </button>
 
          {currentSelectedHorario && (
            <div style={{ borderRadius: '999px', backgroundColor: '#f0fdf4', padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#166534', border: '1px solid #bbf7d0' }}>
              Horario seleccionado
            </div>
          )}
        </div>
 
        {horarios.length === 0 && !loading && (
          <p style={{ margin: '1rem 0 0', fontSize: '0.875rem', color: 'var(--ep-text-muted)' }}>No tienes horarios registrados. Contacta a administración.</p>
        )}
 
        {horarios.length > 0 && (
          <>
            <select
              value={currentSelectedHorario}
              onChange={handleHorarioChange}
              className="form-select"
              style={{ marginTop: '1rem' }}
            >
              <option value="">-- Selecciona un horario --</option>
              {horarios.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.materia} • {h.diaSemana} • {new Date(h.horaInicio).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} - {new Date(h.horaFin).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </option>
              ))}
            </select>
 
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {horarios.map((horario) => {
                const isSelected = currentSelectedHorario === horario.id;
                return (
                  <button
                    key={horario.id}
                    type="button"
                    onClick={() => handleHorarioChange({ target: { value: horario.id } } as React.ChangeEvent<HTMLSelectElement>)}
                    style={{
                      borderRadius: 'var(--ep-radius-card)',
                      border: `2px solid ${isSelected ? 'var(--ep-brand)' : 'var(--ep-line)'}`,
                      backgroundColor: isSelected ? '#f0fdf4' : 'var(--ep-surface)',
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? 'var(--ep-shadow-card)' : 'none'
                    }}
                  >
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ep-text)', margin: 0 }}>{horario.materia}</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--ep-text-muted)' }}>{horario.diaSemana}</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--ep-text-muted)' }}>
                      {new Date(horario.horaInicio).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} - {new Date(horario.horaFin).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        )}
 
        {selectedHorarioObject && (
          <div style={{ marginTop: '1rem', borderRadius: '999px', backgroundColor: '#f0fdf4', padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#166534', border: '1px solid #bbf7d0' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>Horario seleccionado</p>
            <p style={{ margin: '0.25rem 0 0' }}>{selectedHorarioObject.materia}</p>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--ep-text-soft)' }}>{selectedHorarioObject.diaSemana} • {new Date(selectedHorarioObject.horaInicio).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedHorarioObject.horaFin).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        )}
      </article>
 
      {/* Paso 2: Seleccionar Plaza */}
      <article className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--ep-line)', color: 'var(--ep-text)', fontSize: '0.875rem', fontWeight: 700 }}>2</div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ep-text)', margin: 0 }}>Selecciona una plaza</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)', margin: '0.25rem 0 0' }}>Haz clic en una plaza disponible para reservarla.</p>
          </div>
        </div>
 
        {plazas.length === 0 && (
          <p style={{ fontSize: '0.875rem', color: 'var(--ep-text-muted)' }}>No hay plazas para mostrar. Intenta más tarde.</p>
        )}

        {queueMessage && (
          <div style={{ marginBottom: '1rem', borderRadius: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '0.85rem' }}>
            {queueMessage}
          </div>
        )}
 
        {plazas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(plazasPorZona).map(([zona, plazasZona]) => (
              <section key={zona}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--ep-text)' }}>Zona {zona}</h3>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--ep-text-soft)' }}>{plazasZona.length} plazas</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '999px', backgroundColor: 'var(--ep-surface-soft)', color: 'var(--ep-text)' }}>
                    Zona {zona}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                  {plazasZona.map((plaza) => {
                    const isSelected = currentSelectedPlaza === plaza.id;
                    const isAvailable = plaza.estado === 'DISPONIBLE';
 
                    return (
                      <div
                        key={plaza.id}
                        style={{
                          borderRadius: 'var(--ep-radius-card)',
                          border: `2px solid ${isSelected ? 'var(--ep-brand)' : isAvailable ? '#bbf7d0' : 'var(--ep-line)'}`,
                          backgroundColor: isSelected ? 'var(--ep-brand)' : isAvailable ? '#f0fdf4' : 'var(--ep-surface-soft)',
                          color: isSelected ? 'white' : isAvailable ? 'var(--ep-text)' : 'var(--ep-text-muted)',
                          padding: '0.6rem',
                          display: 'grid',
                          gap: '0.4rem',
                          boxShadow: isSelected ? 'var(--ep-shadow-card)' : 'none',
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => handlePlazaChange(e as any, plaza.id)}
                          disabled={!isAvailable}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'center',
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            color: 'inherit',
                            padding: '0.6rem 0.2rem',
                          }}
                        >
                          <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700 }}>{plaza.zona}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8 }}>{plaza.fila}{plaza.numero}</span>
                          <span style={{ display: 'block', fontSize: '0.68rem', marginTop: '0.2rem', opacity: 0.85 }}>
                            {plaza.estado}
                          </span>
                        </button>

                        {!isAvailable && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQueueAction(plaza.id)}
                              disabled={queueLoadingId === plaza.id || !canUseQueue}
                              style={{
                                border: '1px solid var(--ep-line)',
                                backgroundColor: 'white',
                                color: '#1f2937',
                                borderRadius: '999px',
                                padding: '0.25rem 0.45rem',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: queueLoadingId === plaza.id || !canUseQueue ? 'not-allowed' : 'pointer',
                                opacity: queueLoadingId === plaza.id || !canUseQueue ? 0.7 : 1,
                              }}
                            >
                              {queueLoadingId === plaza.id
                                ? 'Procesando...'
                                : (queueMap[plaza.id] ?? []).some((entry) => entry.idUsuario === user.id)
                                  ? 'Salir de cola'
                                  : 'Entrar en cola'}
                            </button>

                            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.65rem', opacity: 0.85 }}>
                              {(() => {
                                const queue = queueMap[plaza.id] ?? [];
                                const pos = queue.findIndex((entry) => entry.idUsuario === user.id);
                                if (pos >= 0) return `Tu posición: ${pos + 1} de ${queue.length}`;
                                if (queue.length > 0) return `Cola activa: ${queue.length}`;
                                return 'Sin cola activa';
                              })()}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
 
        {currentSelectedPlaza && (
          <div style={{ marginTop: '1.5rem', borderRadius: '999px', backgroundColor: '#f0fdf4', padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#166534', border: '1px solid #bbf7d0' }}>
            Plaza seleccionada
          </div>
        )}
      </article>
 
      {/* Paso 3: Confirmar */}
      <article className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--ep-brand)', color: 'white', fontSize: '0.875rem', fontWeight: 700 }}>3</div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ep-text)', margin: 0 }}>Confirmar reserva</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ep-text-soft)', margin: '0.25rem 0 0' }}>Revisa tus selecciones antes de enviar la solicitud.</p>
          </div>
        </div>
 
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            type="submit"
            disabled={!currentSelectedHorario || !currentSelectedPlaza || loading}
            className="btn-primary"
            style={{ marginTop: '0.25rem' }}
          >
            {loading ? 'Reservando...' : 'Confirmar Reserva'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--ep-text-muted)' }}>
            Al confirmar, aceptas los términos de reserva y recibirás confirmación por correo electrónico.
          </p>
        </form>
      </article>
 
      <div style={{ marginTop: '1.5rem' }}>
        <ReservaActivaList />
      </div>
    </div>
  );
}