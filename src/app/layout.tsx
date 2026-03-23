import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Parquea Fácil - Sistema de Gestión de Parqueadero',
  description: 'Aplicación web para la gestión inteligente de plazas de parqueo vehicular del Politécnico',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
