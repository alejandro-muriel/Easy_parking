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

    console.log('✅ Seeding completed successfully!');
    console.log('\n📋 Test credentials:');
    TEST_USERS.forEach((user) => {
      console.log(`    ${user.email} / ${user.password} (${user.roleId})`);
    });
  } catch (e) {
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
