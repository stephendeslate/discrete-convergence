import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED: AE-DATA-001
const prisma = new PrismaClient();

async function main() {
  const tenantId = 'tenant-001';
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: passwordHash,
      name: 'Regular User',
      role: 'USER',
      tenantId,
    },
  });

  // Error/failure state user - deactivated viewer
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      password: passwordHash,
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Sales Overview',
      description: 'Main sales dashboard',
      tenantId,
      userId: admin.id,
      isPublic: true,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'PostgreSQL Production',
      type: 'postgresql',
      config: '{"host":"localhost","port":5432}',
      status: 'ACTIVE',
      tenantId,
      refreshRate: 300,
    },
  });

  // Error state data source
  const errorDataSource = await prisma.dataSource.create({
    data: {
      name: 'Failed MySQL Import',
      type: 'mysql',
      config: '{"host":"unreachable","port":3306}',
      status: 'ERROR',
      tenantId,
      refreshRate: 600,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Revenue Chart',
      type: 'CHART',
      config: '{"chartType":"line","metric":"revenue"}',
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
      tenantId,
      position: 0,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'User Metrics',
      type: 'METRIC',
      config: '{"metric":"active_users"}',
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
      tenantId,
      position: 1,
    },
  });

  // eslint-disable-next-line no-console -- seed script output
  console.log('Seed completed:', { admin: admin.id, user: user.id, viewer: viewer.id, errorDataSource: errorDataSource.id });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
