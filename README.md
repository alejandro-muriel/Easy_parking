# Parquea Facil (Easy Parking)

Aplicacion web para la gestion inteligente de plazas de parqueo vehicular del Politecnico Jaime Isaza Cadavid.

La solucion permite administrar reservas y ocupacion en tiempo real con perfiles diferenciados (estudiante, docente, administrativo, directivo, celador, administrador), visualizacion tipo mapa de asientos y reglas operativas de parqueo.

## 1. Estado Del Proyecto

- Estado actual: ✅ Base tecnica inicializada y operacional (v0.0.1)
- Tipo de entrega: Prototipo funcional en 4 meses (MVP por fases)
- Plataforma objetivo: Web responsive
- Servidor de desarrollo: ✅ Corriendo en http://localhost:3000
- Integraciones en esta fase:
  - Horario institucional: Simulado (mock/CSV)
  - Cobro fuera de horario: Simulado (sin pasarela de pago real)
  - Notificaciones: In-app
- Próxima fase: Diseño del modelo de datos y schema Prisma

## 2. Objetivo General

Desarrollar Parquea Facil para optimizar el uso del parqueadero institucional, reducir congestiones y mejorar la experiencia de acceso al campus mediante una gestion centralizada, visual e inteligente de las plazas.

## 3. Alcance Inicial Del Prototipo (v0.1.x - v0.4.x)

### Incluye

- Inicio de sesion con control de roles
- Gestion de plazas en tiempo real por celadores
- Reserva y cancelacion de plazas por usuarios
- Asignacion y liberacion manual por celador
- Mapa visual de parqueadero (estilo seleccion de asientos)
- Visualizacion de estados: disponible, reservada, ocupada, bloqueada
- Validaciones de reserva duplicada y conflictos de horario
- Prioridad para perfiles con parqueo permanente
- Notificaciones in-app de eventos clave
- Reportes operativos basicos (ocupacion/disponibilidad)

### No incluye en esta etapa

- Integracion real con API/BD de horarios institucionales
- Cobro real con pasarela de pagos
- Notificaciones por email y SMS
- Aplicacion movil nativa

## 4. Stack Tecnologico Y Versiones Objetivo

Las versiones pueden ajustarse segun compatibilidad institucional, pero esta es la linea base recomendada:

- Node.js: 22 LTS
- Next.js: 15.x
- React: 19.x
- TypeScript: 5.x
- Tailwind CSS: 4.x
- PostgreSQL: 16.x
- Prisma ORM: 6.x
- Zod: 4.x
- Gestor de paquetes: npm

## 5. Requisitos Previos

Instalar en tu equipo:

1. Node.js 22 LTS [usa NVM](https://www.nvmnode.com/guide/download.html)
2. npm (incluido con Node.js)
3. PostgreSQL [local](https://www.postgresql.org/download/), [docker](https://hub.docker.com/_/postgres) o remoto
4. [Git](https://git-scm.com/install/)

Verificacion sugerida:

```bash
node -v
npm -v
git --version
```

## 6. Instalacion Del Proyecto

1. Clonar repositorio

```bash
git clone https://github.com/alejandro-muriel/Easy_parking.git
cd Easy_parking
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

Crear archivo `.env.local` con base en el ejemplo del proyecto cuando exista (`.env.local.example`).

Variables esperadas (base):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/easy_parking"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cambiar-por-valor-seguro"
APP_ENV="development"
```

4. Ejecutar migraciones de base de datos

```bash
npx prisma migrate dev
```

5. Sembrar datos de prueba (cuando exista seed)

```bash
npx prisma db seed
```

## 7. Ejecucion En Desarrollo

Iniciar servidor local:

```bash
npm run dev
```

Abrir en navegador:

- http://localhost:3000

Comandos frecuentes:

```bash
npm run build
npm run start
npm run lint
```

## 8. Estructura Base Del Proyecto (Objetivo)

```text
Easy_parking/
	README.md
	package.json
	.env.local.example
	prisma/
		schema.prisma
		seed.ts
	src/
		app/
			(auth)/
			(parking)/
			admin/
			api/
		components/
		server/
		lib/
```

Descripcion rapida:

- `src/app`: rutas, paginas y handlers API
- `src/components`: componentes de interfaz
- `src/server`: servicios de negocio y reglas
- `src/lib`: utilidades, helpers y acceso a datos
- `prisma`: modelo de datos, migraciones y datos semilla

## 9. Modulos Funcionales (Base)

1. Acceso y perfiles (auth + autorizacion)
2. Reservas y asignacion en tiempo real
3. Mapa visual del parqueadero
4. Excepciones por huecos academicos (simuladas)
5. Cobro fuera de horario (simulado)
6. Notificaciones in-app
7. Reportes operativos
8. Configuracion administrativa

## 10. Reglas De Negocio Criticas

- No permitir reserva duplicada del mismo usuario en el mismo horario.
- No permitir doble asignacion de una plaza en el mismo rango temporal.
- Dar prioridad de asignacion a usuarios con parqueo permanente.
- Permitir liberacion manual por celador cuando hay retiro anticipado.
- Aplicar bloqueo temporal de plaza luego de liberacion manual (anti-reserva inmediata no autorizada).
- Restringir plazas segun perfil cuando corresponda.

## 11. Requisitos No Funcionales Objetivo (Prototipo)

- Actualizacion de estado de plaza en un maximo de 2 a 3 segundos.
- Soporte minimo de 50 usuarios concurrentes.
- Disponibilidad objetivo del servicio: 99% en horario operativo.
- Seguridad de transporte: HTTPS con TLS 1.2 o superior.
- Persistencia historica minima de reservas/uso: 15 dias.
- Interfaz utilizable en resolucion minima 1280x720.

## 12. Flujo Base De Uso

1. Usuario inicia sesion segun su perfil.
2. Consulta mapa y disponibilidad.
3. Reserva plaza o solicita asignacion.
4. Celador puede asignar/liberar manualmente en tiempo real.
5. El sistema actualiza estado y notifica eventos clave.
6. Administrador consulta reportes y configura reglas operativas.

## 13. Tabla Viva De Features

Esta seccion se actualiza en cada iteracion.

| ID | Feature | Estado | Version objetivo | Notas |
|---|---|---|---|---|
| F-01 | Login y control por roles | En desarrollo | v0.1.0 | Base para perfiles del sistema |
| F-02 | Reserva y cancelacion de plaza | Planificado | v0.2.0 | Incluye validacion de conflictos |
| F-03 | Asignacion/liberacion por celador | Planificado | v0.2.0 | Operacion en tiempo real |
| F-04 | Mapa visual tipo cine | Planificado | v0.3.0 | Estados visuales de plazas |
| F-05 | Prioridad parqueo permanente | Planificado | v0.3.0 | Regla de asignacion |
| F-06 | Notificaciones in-app | Planificado | v0.3.0 | Confirmaciones y recordatorios |
| F-07 | Reportes de ocupacion y disponibilidad | Planificado | v0.4.0 | Reporte operativo base |
| F-08 | Integracion horarios institucionales reales | Backlog | v1.0.0+ | En prototipo se simula |
| F-09 | Cobro real con pasarela | Backlog | v1.0.0+ | En prototipo se simula |
| F-10 | Notificaciones email/SMS | Backlog | v1.0.0+ | Fase posterior |

## 14. Versionado Del Proyecto

Se sugiere seguir versionado semantico: `MAJOR.MINOR.PATCH`.

Convencion propuesta:

- MAJOR: cambios grandes o incompatibles
- MINOR: nuevas funcionalidades compatibles
- PATCH: correcciones menores

Historial:

| Version | Estado | Fecha | Cambios |
|---|---|---|---|
| v0.0.1 | Completada | 2026-03-23 | Infraestructura base: Next.js 15 + TypeScript + Tailwind CSS 4 + Prisma 6, Node.js 22, estructura de carpetas, configuracion inicial, servidor de desarrollo operativo |

## 15. Roadmap De 4 Meses (Resumen)

1. Mes 1: Fundaciones tecnicas, auth y perfiles
2. Mes 2: Reservas core, asignacion/liberacion y validaciones
3. Mes 3: Mapa visual, notificaciones in-app y reglas academicas simuladas
4. Mes 4: Reportes, hardening RNF y cierre de prototipo

## 16. Criterios Minimos De Aceptacion Del Prototipo

- El sistema permite reservar, asignar y liberar plazas sin conflictos de concurrencia visibles.
- El mapa refleja cambios de estado en tiempo real dentro de la meta definida.
- Los roles aplican restricciones correctas sobre acciones y vistas.
- Se puede demostrar la logica de horario y cobro en modo simulado.
- Existe trazabilidad de funcionalidades y versiones en este README.

## 17. Contribucion (Base)

1. Crear rama desde `main`.
2. Implementar cambio con alcance claro.
3. Actualizar este README si el cambio afecta arquitectura, features o version.
4. Abrir pull request con descripcion funcional y tecnica.

## 18. Licencia

Definir licencia del proyecto (pendiente).

# Documentacion base del proyecto
[DOCUMENTO DE GOOGLE](https://docs.google.com/document/d/11T-7ITqCzKdlYmcqYc6z7Rda00ftLoUX1QtH13d-HOs/edit?usp=sharing)
