import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

// TRACED: AE-INFRA-001
async function main() {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@analytics.test' },
    update: {},
    create: {
      email: 'admin@analytics.test',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@analytics.test' },
    update: {},
    create: {
      email: 'viewer@analytics.test',
      password: hashedPassword,
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Sales Overview',
      description: 'Sales analytics dashboard',
      status: 'PUBLISHED',
      tenantId,
      userId: admin.id,
    },
  });

  const archivedDashboard = await prisma.dashboard.create({
    data: {
      name: 'Deprecated Report',
      description: 'This dashboard is no longer active',
      status: 'ARCHIVED',
      tenantId,
      userId: admin.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Production PostgreSQL',
      type: 'POSTGRESQL',
      status: 'ACTIVE',
      tenantId,
    },
  });

  const errorDataSource = await prisma.dataSource.create({
    data: {
      name: 'Broken CSV Import',
      type: 'CSV',
      status: 'ERROR',
      tenantId,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Revenue Chart',
      type: 'LINE_CHART',
      config: JSON.stringify({ timeRange: '30d', metric: 'revenue' }),
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
      tenantId,
      width: 6,
      height: 4,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Error Widget',
      type: 'KPI',
      config: JSON.stringify({ metric: 'error_rate' }),
      dashboardId: archivedDashboard.id,
      dataSourceId: errorDataSource.id,
      tenantId,
      width: 3,
      height: 2,
    },
  });

  await prisma.queryExecution.create({
    data: {
      query: 'SELECT COUNT(*) FROM orders',
      dataSourceId: dataSource.id,
      tenantId,
      executionTime: 42,
      rowCount: 1,
      cost: 0.05,
      status: 'completed',
    },
  });

  await prisma.queryExecution.create({
    data: {
      query: 'SELECT * FROM nonexistent_table',
      dataSourceId: errorDataSource.id,
      tenantId,
      executionTime: 0,
      rowCount: 0,
      cost: 0,
      status: 'failed',
      error: 'relation "nonexistent_table" does not exist',
    },
  });

  process.stdout.write(
    `Seeded: ${admin.email}, ${viewer.email}, ${dashboard.name}, ${archivedDashboard.name}, ${dataSource.name}, ${errorDataSource.name}\n`,
  );
}

main()
  .catch((e: Error) => {
    process.stderr.write(`Seed error: ${e.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
