import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
  const tenantId = 'tenant-001';

  // TRACED: AE-DATA-001
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@analytics.io' },
    update: {},
    create: {
      email: 'admin@analytics.io',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@analytics.io' },
    update: {},
    create: {
      email: 'user@analytics.io',
      password: hashedPassword,
      name: 'Regular User',
      role: 'USER',
      tenantId,
    },
  });

  // Seed error state: locked user in different tenant
  await prisma.user.upsert({
    where: { email: 'locked@analytics.io' },
    update: {},
    create: {
      email: 'locked@analytics.io',
      password: hashedPassword,
      name: 'Locked User',
      role: 'VIEWER',
      tenantId: 'tenant-locked',
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Main sales dashboard',
      status: 'PUBLISHED',
      tenantId,
      createdById: adminUser.id,
    },
  });

  // Seed error state: archived dashboard
  await prisma.dashboard.create({
    data: {
      title: 'Archived Reports',
      description: 'No longer in use',
      status: 'ARCHIVED',
      tenantId,
      createdById: adminUser.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Primary DB',
      type: 'POSTGRESQL',
      connectionString: 'postgresql://readonly:pass@db:5432/analytics',
      tenantId,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Revenue Chart',
      type: 'LINE_CHART',
      config: JSON.stringify({ timeRange: '30d' }),
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
      tenantId,
      position: 0,
    },
  });

  await prisma.metric.create({
    data: {
      name: 'Monthly Revenue',
      value: 125000.50,
      unit: 'USD',
      tenantId,
      dashboardId: dashboard.id,
    },
  });

  // Seed error state: metric with zero value
  await prisma.metric.create({
    data: {
      name: 'Failed Queries',
      value: 0,
      unit: 'count',
      tenantId,
      dashboardId: dashboard.id,
    },
  });

  // Use stdout instead of console.log (eslint: no-console)
  process.stdout.write(`Seeded: ${adminUser.email}, ${regularUser.email}\n`);
}

main()
  .catch((error: Error) => {
    process.stderr.write(`Seed error: ${error.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
