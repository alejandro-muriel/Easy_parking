'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BotonCancelarProps {
  reservaId: string;
}

export function BotonCancelarReserva({ reservaId }: BotonCancelarProps) {
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const manejarCancelacion = async () => {
    const confirmar = confirm('¿Estás seguro de que deseas cancelar esta reserva de parqueo?');
    if (!confirmar) return;

    setCargando(true);

    try {
      const respuesta = await fetch('/api/reservas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservaId }),
      });

      const datos = await respuesta.json();

      alert(datos.message);

      if (respuesta.ok) {
        router.refresh(); 
      }
    } catch (error) {
      alert('Error de conexión con el servidor de parqueo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      onClick={manejarCancelacion}
      disabled={cargando}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background-color 0.15s'
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
    >
      {cargando ? 'Cancelando...' : 'Cancelar Reserva'}
    </button>
  );
}