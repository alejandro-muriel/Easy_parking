import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type RoleSeed = {
  name: string;
  description: string;
};

type PermissionSeed = {
  resource: string;
  action: string;
  key: string;
  description: string;
};

type TestUserSeed = {
  email: string;
  name: string;
  roleId: string;
  password: string;
};

// Definición de roles
const ROLES: RoleSeed[] = [
  { name: 'ESTUDIANTE', description: 'Usuario universitario con acceso a reservas' },
  { name: 'DOCENTE', description: 'Profesor universitario' },
  { name: 'ADMINISTRATIVO', description: 'Personal administrativo' },
  { name: 'DIRECTIVO', description: 'Rectoría/Dirección' },
  { name: 'CELADOR', description: 'Operador de parqueadero' },
  { name: 'ADMIN', description: 'Administrador del sistema' },
];

// Definición de permisos
const PERMISSIONS: PermissionSeed[] = [
  // Auth
  { resource: 'auth', action: 'login', key: 'auth.login', description: 'Acceso al sistema' },

  // Parking
  {
    resource: 'parking',
    action: 'view.map',
    key: 'parking.view.map',
    description: 'Ver mapa de plazas',
  },
  {
    resource: 'parking',
    action: 'view.availability',
    key: 'parking.view.availability',
    description: 'Ver disponibilidad',
  },
  {
    resource: 'parking',
    action: 'reserve.create',
    key: 'parking.reserve.create',
    description: 'Crear reserva',
  },
  {
    resource: 'parking',
    action: 'reserve.cancel',
    key: 'parking.reserve.cancel',
    description: 'Cancelar propia reserva',
  },
  {
    resource: 'parking',
    action: 'slot.manage.assign',
    key: 'parking.slot.manage.assign',
    description: 'Asignar plaza (celador)',
  },
  {
    resource: 'parking',
    action: 'slot.manage.release',
    key: 'parking.slot.manage.release',
    description: 'Liberar plaza (celador)',
  },

  // Admin
  { resource: 'admin', action: 'user.manage', key: 'admin.user.manage', description: 'Gestionar usuarios' },
  {
    resource: 'admin',
    action: 'config.manage',
    key: 'admin.config.manage',
    description: 'Configurar sistema',
  },
  {
    resource: 'admin',
    action: 'reports.view',
    key: 'admin.reports.view',
    description: 'Ver reportes',
  },
  {
    resource: 'admin',
    action: 'audit.view',
    key: 'admin.audit.view',
    description: 'Ver auditoría',
  },
];

// Matriz: qué permisos tiene cada rol
const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  ESTUDIANTE: ['auth.login', 'parking.view.map', 'parking.view.availability', 'parking.reserve.create', 'parking.reserve.cancel'],
  DOCENTE: ['auth.login', 'parking.view.map', 'parking.view.availability', 'parking.reserve.create', 'parking.reserve.cancel'],
  ADMINISTRATIVO: ['auth.login', 'parking.view.map', 'parking.view.availability', 'admin.reports.view'],
  DIRECTIVO: ['auth.login', 'admin.reports.view', 'admin.audit.view'],
  CELADOR: [
    'auth.login',
    'parking.view.map',
    'parking.view.availability',
    'parking.slot.manage.assign',
    'parking.slot.manage.release',
    'admin.audit.view',
  ],
  ADMIN: [
    'auth.login',
    'parking.view.map',
    'parking.view.availability',
    'admin.user.manage',
    'admin.config.manage',
    'admin.reports.view',
    'admin.audit.view',
  ],
};

// Usuarios de prueba (una por rol)
const TEST_USERS: TestUserSeed[] = [
  { email: 'estudiante@poli.edu.co', name: 'Juan Estudiante', roleId: 'ESTUDIANTE', password: 'Test123!' },
  { email: 'docente@poli.edu.co', name: 'María Docente', roleId: 'DOCENTE', password: 'Test123!' },
  { email: 'admin@poli.edu.co', name: 'Carlos Admin', roleId: 'ADMIN', password: 'Test123!' },
  { email: 'celador@poli.edu.co', name: 'Roberto Celador', roleId: 'CELADOR', password: 'Test123!' },
];

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Crear roles
    console.log('  Creating roles...');
    const createdRoles = await Promise.all(
      ROLES.map((role) =>
        prisma.role.upsert({
          where: { name: role.name },
          update: { description: role.description },
          create: role,
        }),
      ),
    );
    console.log(`    ✓ ${createdRoles.length} roles created/updated`);

    // 2. Crear permisos
    console.log('  Creating permissions...');
    const createdPermissions = await Promise.all(
      PERMISSIONS.map((perm) =>
        prisma.permission.upsert({
          where: { key: perm.key },
          update: { description: perm.description },
          create: perm,
        }),
      ),
    );
    console.log(`    ✓ ${createdPermissions.length} permissions created/updated`);

    // 3. Crear matriz de RolePermission
    console.log('  Assigning permissions to roles...');
    let assignmentCount = 0;
    for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSION_MAP)) {
      const role = createdRoles.find((roleItem) => roleItem.name === roleName);
      if (!role) {
        console.warn(`    ⚠ Role ${roleName} not found`);
        continue;
      }

      for (const permKey of permissionKeys) {
        const perm = createdPermissions.find((permissionItem) => permissionItem.key === permKey);
        if (!perm) {
          console.warn(`    ⚠ Permission ${permKey} not found`);
          continue;
        }

        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
        assignmentCount++;
      }
    }
    console.log(`    ✓ ${assignmentCount} role-permission assignments created`);

    // 4. Crear usuarios de prueba
    console.log('  Creating test users...');
    const createdUsers = await Promise.all(
      TEST_USERS.map(async (testUser) => {
        const role = createdRoles.find((roleItem) => roleItem.name === testUser.roleId);
        if (!role) {
          console.warn(`    ⚠ Role ${testUser.roleId} not found for user ${testUser.email}`);
          return null;
        }

        const passwordHash = await bcrypt.hash(testUser.password, 10);
        return prisma.user.upsert({
          where: { email: testUser.email },
          update: { passwordHash },
          create: {
            email: testUser.email,
            name: testUser.name,
            passwordHash,
            roleId: role.id,
          },
        });
      }),
    );
    console.log(`    ✓ ${createdUsers.filter(Boolean).length} test users created/updated`);

    // 5. Crear plazas de parqueo de prueba
console.log('  Creating parking spots...');
const PLAZAS = [
  // Zona A - 6 plazas normales
  { zona: 'A', fila: 'A', numero: 1, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  { zona: 'A', fila: 'A', numero: 2, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  { zona: 'A', fila: 'A', numero: 3, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  { zona: 'A', fila: 'B', numero: 1, estado: 'DISPONIBLE' as const, tipo: 'PREFERENCIAL' as const },
  { zona: 'A', fila: 'B', numero: 2, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  { zona: 'A', fila: 'B', numero: 3, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  // Zona B - 6 plazas
  { zona: 'B', fila: 'A', numero: 1, estado: 'DISPONIBLE' as const, tipo: 'PERMANENTE' as const },
  { zona: 'B', fila: 'A', numero: 2, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  { zona: 'B', fila: 'A', numero: 3, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  { zona: 'B', fila: 'B', numero: 1, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  { zona: 'B', fila: 'B', numero: 2, estado: 'DISPONIBLE' as const, tipo: 'NORMAL' as const },
  { zona: 'B', fila: 'B', numero: 3, estado: 'DISPONIBLE' as const, tipo: 'PREFERENCIAL' as const },
];

for (const plaza of PLAZAS) {
  await prisma.plazaParqueo.upsert({
    where: { zona_fila_numero: { zona: plaza.zona, fila: plaza.fila, numero: plaza.numero } },
    update: {},
    create: {
      zona: plaza.zona,
      fila: plaza.fila,
      numero: plaza.numero,
      estado: plaza.estado,
      tipo: plaza.tipo,
      ultimoCambio: new Date(),
    },
  });
}
console.log(`    ✓ ${PLAZAS.length} parking spots created/updated`);

// 6. Crear horarios académicos de prueba
    console.log('  Creating academic schedules...');
    const estudiante = createdUsers.find(u => u?.email === 'estudiante@poli.edu.co');
    const docente = createdUsers.find(u => u?.email === 'docente@poli.edu.co');

    const HORARIOS_ACADEMICOS = [
      // Horarios del estudiante
      {
        materia: 'Matemáticas I',
        horaInicio: new Date('2026-04-07T08:00:00.000Z'), // Lunes 8:00 AM
        horaFin: new Date('2026-04-07T10:00:00.000Z'),     // Lunes 10:00 AM
        diaSemana: 'lunes',
        idUsuario: estudiante?.id || '',
      },
      {
        materia: 'Física I',
        horaInicio: new Date('2026-04-08T10:30:00.000Z'), // Martes 10:30 AM
        horaFin: new Date('2026-04-08T12:30:00.000Z'),     // Martes 12:30 PM
        diaSemana: 'martes',
        idUsuario: estudiante?.id || '',
      },
      {
        materia: 'Programación I',
        horaInicio: new Date('2026-04-09T14:00:00.000Z'), // Miércoles 2:00 PM
        horaFin: new Date('2026-04-09T16:00:00.000Z'),     // Miércoles 4:00 PM
        diaSemana: 'miércoles',
        idUsuario: estudiante?.id || '',
      },
      // Horarios del docente
      {
        materia: 'Estructuras de Datos',
        horaInicio: new Date('2026-04-07T14:00:00.000Z'), // Lunes 2:00 PM
        horaFin: new Date('2026-04-07T16:00:00.000Z'),     // Lunes 4:00 PM
        diaSemana: 'lunes',
        idUsuario: docente?.id || '',
      },
      {
        materia: 'Bases de Datos',
        horaInicio: new Date('2026-04-08T08:00:00.000Z'), // Martes 8:00 AM
        horaFin: new Date('2026-04-08T10:00:00.000Z'),     // Martes 10:00 AM
        diaSemana: 'martes',
        idUsuario: docente?.id || '',
      },
    ];

    const createdHorarios = await Promise.all(
      HORARIOS_ACADEMICOS.filter(h => h.idUsuario).map(horario =>
        prisma.horario.create({
          data: {
            materia: horario.materia,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            diaSemana: horario.diaSemana,
            idUsuario: horario.idUsuario,
          },
        })
      )
    );
    console.log(`    ✓ ${createdHorarios.length} academic schedules created`);

    // 7. Crear reservas de prueba basadas en horarios académicos
    console.log('  Creating reservations based on academic schedules...');

    // Obtener plazas disponibles para reservas
    const plazasDisponibles = await prisma.plazaParqueo.findMany({
      where: { estado: 'DISPONIBLE' },
      take: 3, // Tomar 3 plazas para reservas de prueba
    });

    const RESERVAS_PRUEBA = [
      // Reserva del estudiante para Matemáticas I (Lunes)
      {
        horario: createdHorarios.find(h => h.materia === 'Matemáticas I'),
        plaza: plazasDisponibles[0],
        fechaReserva: new Date('2026-04-07T08:00:00.000Z'), // Próximo lunes
      },
      // Reserva del docente para Estructuras de Datos (Lunes)
      {
        horario: createdHorarios.find(h => h.materia === 'Estructuras de Datos'),
        plaza: plazasDisponibles[1],
        fechaReserva: new Date('2026-04-07T14:00:00.000Z'), // Próximo lunes
      },
      // Reserva futura del estudiante para Física I (Martes)
      {
        horario: createdHorarios.find(h => h.materia === 'Física I'),
        plaza: plazasDisponibles[2],
        fechaReserva: new Date('2026-04-08T10:30:00.000Z'), // Próximo martes
      },
    ];

    let reservasCreadas = 0;
    for (const reservaData of RESERVAS_PRUEBA) {
      if (!reservaData.horario || !reservaData.plaza) continue;

      // Calcular fecha y hora de fin basada en el horario académico
      const fechaHoraFin = new Date(reservaData.fechaReserva);
      const duracionMilisegundos = reservaData.horario.horaFin.getTime() - reservaData.horario.horaInicio.getTime();
      fechaHoraFin.setTime(fechaHoraFin.getTime() + duracionMilisegundos);

      await prisma.reserva.create({
        data: {
          idUsuario: reservaData.horario.idUsuario,
          idPlaza: reservaData.plaza.id,
          fechaHoraInicio: reservaData.fechaReserva,
          fechaHoraFin: fechaHoraFin,
          estado: 'ACTIVA',
          metodoPago: 'TARJETA_CREDITO',
        },
      });

      // Actualizar estado de la plaza a RESERVADA
      await prisma.plazaParqueo.update({
        where: { id: reservaData.plaza.id },
        data: {
          estado: 'RESERVADA',
          ultimoCambio: new Date(),
        },
      });

      reservasCreadas++;
    }
    console.log(`    ✓ ${reservasCreadas} reservations created and plazas updated`);

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📋 Test credentials:');
    TEST_USERS.forEach((user) => {
      console.log(`    ${user.email} / ${user.password} (${user.roleId})`);
    });

    console.log('\n🏫 Academic schedules created:');
    createdHorarios.forEach((horario) => {
      const user = createdUsers.find(u => u?.id === horario.idUsuario);
      console.log(`    ${user?.name}: ${horario.materia} - ${horario.diaSemana} ${horario.horaInicio.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}-${horario.horaFin.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`);
    });

    console.log('\n🚗 Reservation flow demonstration:');
    console.log('    1. Users can view available parking spots');
    console.log('    2. Select a spot linked to their class schedule');
    console.log('    3. System validates schedule conflicts');
    console.log('    4. Reservation is created and spot status updated');
    console.log('    5. Confirmation is sent to user');

    console.log('\n📊 Current database status:');
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.permission.count(),
      prisma.plazaParqueo.count(),
      prisma.horario.count(),
      prisma.reserva.count(),
    ]);

    console.log(`    Users: ${stats[0]} | Roles: ${stats[1]} | Permissions: ${stats[2]}`);
    console.log(`    Parking spots: ${stats[3]} | Schedules: ${stats[4]} | Reservations: ${stats[5]}`);
  }
  catch (e) {
    console.error('❌ Seeding failed:', e);
    throw e;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
