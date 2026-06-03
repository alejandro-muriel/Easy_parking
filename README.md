# Parquea Facil (Easy Parking)

Aplicacion web para la gestion de parqueaderos del Politecnico Colombiano Jaime Isaza Cadavid.

## Estado actual 

- Version: `0.0.1`
- Stack base operativo: Next.js 15 + TypeScript + Prisma + PostgreSQL + Tailwind 4
- F-01 (autenticacion y autorizacion): implementado y probado
- F-02 (gestion de reservas): implementado y probado
- F-03 (operacion de plazas por celador): implementado de forma parcial (sin flujo completo de auditoria)
- F-04 (mapa visual de plazas): implementado para consulta y operacion

## Funcionalidad implementada

### F-01: Autenticacion y autorizacion
- Login con email institucional y password
- Sesiones persistidas en base de datos (no JWT)
- Cookie de sesion `httpOnly`
- Endpoint de perfil autenticado (`/api/auth/me`)
- Logout con revocacion de sesion
- Guards de servidor para rutas protegidas
- Middleware para redireccion a login cuando no hay sesion
- Dashboard protegido

### F-02: Gestion de reservas de parqueo
- Consulta de horarios del usuario (`/api/horarios`)
- Consulta de plazas con filtros por estado y zona (`/api/plazas`)
- Creacion de reservas (`/api/reservas`, `POST`) con validaciones de horario, disponibilidad y duplicados
- Consulta de reservas activas del usuario (`/api/reservas`, `GET`)
- Extension de reserva con validacion previa (`/api/reservas/[id]/can-extend`) y ejecucion (`/api/reservas/[id]/extend`)
- Cola FIFO por plaza para gestionar prioridad (`/api/plazas/[id]/cola`)
- Formulario de reserva y resumen en UI (`/reserva` y dashboard), incluyendo modal de confirmacion para extensiones

### F-03/F-04: Operacion y visualizacion de plazas
- Vista de celador con mapa visual por zonas (`/celador`)
- Acciones de asignar, liberar, bloquear y desbloquear plazas
- Conteo por estado (disponible, ocupada, reservada, bloqueada)
- Bloqueo temporal de plazas tras liberacion y desbloqueo automatico por expiracion

## Tecnologias

- Node.js `>=20`
- npm `>=10`
- Next.js `^15.0.0`
- React `^19.0.0`
- TypeScript `^6.0.2`
- Prisma `^6.19.3`
- PostgreSQL
- Vitest + Testing Library

## Estructura principal

```text
prisma/
  schema.prisma
  seed.ts
  tsconfig.json

src/
  app/
    api/auth/login/route.ts
    api/auth/logout/route.ts
    api/auth/me/route.ts
    api/horarios/route.ts
    api/plazas/route.ts
    api/plazas/[id]/cola/route.ts
    api/reservas/route.ts
    api/reservas/[id]/can-extend/route.ts
    api/reservas/[id]/extend/route.ts
    (parking)/reserva/page.tsx
    (parking)/celador/page.tsx
    dashboard/page.tsx
    login/page.tsx
    page.tsx
    layout.tsx
    globals.css
  components/auth/
    login-form.tsx
    logout-button.tsx
  components/reserva/
    reserva-form.tsx
    reserva-summary-list.tsx
  components/celador/
    PlazaGrid.tsx
    PlazaCard.tsx
  server/auth/
    config.ts
    session.ts
    service.ts
    guards.ts
  server/plazas/
    service.ts
    actions.ts
  server/reservas/
    config.ts
    extension-service.ts
    extension-service.test.ts
  lib/
    prisma.ts
  middleware.ts

vitest.config.ts
vitest.setup.ts
```

## Variables de entorno

### `.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/easy_parking"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cambiar-por-valor-seguro"
APP_ENV="development"
RESERVA_EXTENSION_MINUTES="20"
RESERVA_EXTENSION_WINDOW_MINUTES="20"
RESERVA_EXTENSION_MAX_COUNT="1"
RESERVA_NOTIFICATION_DELAY_MINUTES="10"
```

Notas de configuracion:
- `RESERVA_EXTENSION_MINUTES`: minutos por extension (default `20`, rango `5-120`).
- `RESERVA_EXTENSION_WINDOW_MINUTES`: tolerancia en minutos para solicitar extension despues del fin (default `20`, rango `0-60`).
- `RESERVA_EXTENSION_MAX_COUNT`: maximo de extensiones por reserva (default `1`, rango `1-5`).
- `RESERVA_NOTIFICATION_DELAY_MINUTES`: tiempo de espera para enviar SMS/email mock si el usuario no interactua con la notificacion push (default `10`, rango `1-15`).

## Instalacion y ejecucion

1. Instalar dependencias

```bash
npm install
```

2. Aplicar schema Prisma

```bash
npx prisma db push
```

Nota: en algunos entornos PostgreSQL antiguos, `prisma migrate dev` puede fallar con shadow database. En este proyecto se usa `db push` para desarrollo local.

3. Sembrar datos de prueba

```bash
npm run seed
```

4. Ejecutar en desarrollo

```bash
npm run dev
```

5. Build de produccion

```bash
npm run build
npm run start
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seed
npm run test
npm run test:watch
npm run test:coverage
```

## Rutas y comportamiento

- `/` redirige a `/dashboard`
- `/login` publica
- `/dashboard` protegida por sesion
- `/reserva` protegida por sesion
- `/celador` protegida por sesion y permisos de rol
- `/api/auth/login` publica
- `/api/auth/logout` protegida por cookie/sesion
- `/api/auth/me` protegida por cookie/sesion
- `/api/horarios` protegida por cookie/sesion
- `/api/plazas` protegida por cookie/sesion
- `/api/reservas` protegida por cookie/sesion
- `/api/plazas/[id]/cola` protegida por cookie/sesion
- `/api/reservas/[id]/can-extend` protegida por cookie/sesion
- `/api/reservas/[id]/extend` protegida por cookie/sesion
- `/api/notificaciones/mock` protegida por cookie/sesion

## Modelos Prisma actuales

- `Role`
- `Permission`
- `RolePermission`
- `User`
- `Session`
- `PlazaParqueo`
- `Reserva`
- `ReservaExtension`
- `ColaEspera`
- `Horario`

## Usuarios demo (seed)

Password para todos: `Test123!`

- `admin@poli.edu.co`
- `docente@poli.edu.co`
- `estudiante@poli.edu.co`
- `celador@poli.edu.co`

## Testing

Configuracion con Vitest + jsdom + Testing Library.

Estado actual:

- Test files: `11`
- Tests: `52` pasando
- Coverage total:
  - Statements: `54.2%`
  - Branches: `40.87%`
  - Functions: `51.11%`
  - Lines: `55.48%`

## Notas tecnicas

- Middleware excluye assets estaticos (por ejemplo `.svg`, `.png`, `.woff2`) para evitar redirecciones indebidas al login.
- El login usa logo desde `public/logo.svg` con fallback `public/logo.png`.
- `next.config.js` tiene `eslint.ignoreDuringBuilds: true` para evitar warning conocido en combinacion Next 15 + ESLint 8.

## Roadmap corto

### ÉPICA 1: Gestión de reservas de parqueo
- Estado: En progreso avanzado
- Implementado: creacion y consulta de reservas, validaciones de horario/disponibilidad, extension de reservas con tolerancia, historial de extensiones, cola FIFO por plaza y UI de confirmacion
- Falta: cancelacion/edicion de reserva, expiracion automatica de reservas vencidas, confirmacion real por correo (actualmente pendiente)

### ÉPICA 2: Consulta y visualización de disponibilidad de plazas
- Estado: Implementada
- Implementado: consulta de plazas por estado/zona, mapa visual en UI, leyenda y filtros por estado, integracion de cola en UI para plazas no disponibles
- Falta: visualizacion historica (tendencias de ocupacion), mejoras UX de tiempo real y panel dedicado de posicion en cola

### ÉPICA 3: Reportes y monitoreo del sistema
- Estado: Pendiente
- Implementado: conteos operativos basicos en panel de celador
- Falta: reportes agregados por rango de fechas, metricas de uso, auditoria de eventos y alertas

### ÉPICA 4: Administración de usuarios y seguridad
- Estado: En progreso
- Implementado: roles, permisos, matriz role-permission, control de acceso por guardas
- Falta: modulo administrativo de usuarios (CRUD), gestion de estados de cuenta desde UI, trazabilidad/auditoria administrativa

## Autores

- Sebastian Gonzalez G.
- Juan Diego Cano
- Santiago Ramos Gonzalez
- Alejandro Muriel
- Jose Luis Baez

## Licencia

ISC
