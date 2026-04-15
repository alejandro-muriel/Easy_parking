# Parquea Facil (Easy Parking)

Aplicacion web para la gestion de parqueaderos del Politecnico Colombiano Jaime Isaza Cadavid.

## Estado actual 

- Version: `0.0.1`
- Stack base operativo: Next.js 15 + TypeScript + Prisma + PostgreSQL + Tailwind 4
- F-01 (autenticacion y autorizacion): implementado y probado
- F-02 (reservas): pendiente

## Funcionalidad implementada (F-01)

- Login con email institucional y password
- Sesiones persistidas en base de datos (no JWT)
- Cookie de sesion `httpOnly`
- Endpoint de perfil autenticado (`/api/auth/me`)
- Logout con revocacion de sesion
- Guards de servidor para rutas protegidas
- Middleware para redireccion a login cuando no hay sesion
- Dashboard protegido

## Tecnologias

- Node.js `>=20`
- npm `>=10`
- Next.js `^15.0.0`
- React `^19.0.0`
- TypeScript `^5.3.0`
- Prisma `^6.19.2`
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
    dashboard/page.tsx
    login/page.tsx
    page.tsx
    layout.tsx
    globals.css
  components/auth/
    login-form.tsx
    logout-button.tsx
  server/auth/
    config.ts
    session.ts
    service.ts
    guards.ts
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
```

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
- `/api/auth/login` publica
- `/api/auth/logout` protegida por cookie/sesion
- `/api/auth/me` protegida por cookie/sesion

## Modelos Prisma actuales

- `Role`
- `Permission`
- `RolePermission`
- `User`
- `Session`

## Usuarios demo (seed)

Password para todos: `Test123!`

- `admin@poli.edu.co`
- `docente@poli.edu.co`
- `estudiante@poli.edu.co`
- `celador@poli.edu.co`

## Testing

Configuracion con Vitest + jsdom + Testing Library.

Estado actual:

- Test files: `9`
- Tests: `46` pasando
- Coverage total:
  - Statements: `100%`
  - Branches: `89.36%`
  - Functions: `100%`
  - Lines: `100%`

## Notas tecnicas

- Middleware excluye assets estaticos (por ejemplo `.svg`, `.png`, `.woff2`) para evitar redirecciones indebidas al login.
- El login usa logo desde `public/logo.svg` con fallback `public/logo.png`.
- `next.config.js` tiene `eslint.ignoreDuringBuilds: true` para evitar warning conocido en combinacion Next 15 + ESLint 8.

## Roadmap corto

- F-01: completado
- F-02: reservas y cancelacion (pendiente)
- F-03: asignacion/liberacion por celador (pendiente)
- F-04: mapa visual de plazas (pendiente)

## Autores

- Sebastian Gonzalez G.
- Juan Diego Cano
- Santiago Ramos Gonzalez
- Alejandro Muriel
- Jose Luis Baez

## Licencia

ISC
