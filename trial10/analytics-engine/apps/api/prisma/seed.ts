import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const adminHash = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
  const userHash = await bcrypt.hash('user123', BCRYPT_SALT_ROUNDS);

  // TRACED: AE-AUTH-001
  const admin = await prisma.user.upsert({
    where: { email: 'admin@analytics.io' },
    update: {},
    create: {
      email: 'admin@analytics.io',
      passwordHash: adminHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@analytics.io' },
    update: {},
    create: {
      email: 'viewer@analytics.io',
      passwordHash: userHash,
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId,
    },
  });

  // Seed dashboard with published status
  const dashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Key sales metrics dashboard',
      status: 'PUBLISHED',
      tenantId,
      userId: admin.id,
    },
  });

  // Error state: archived dashboard
  await prisma.dashboard.create({
    data: {
      title: 'Deprecated Metrics',
      description: 'Archived dashboard for testing error states',
      status: 'ARCHIVED',
      tenantId,
      userId: admin.id,
    },
  });

  // Seed data source
  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Primary PostgreSQL',
      type: 'POSTGRESQL',
      connectionUrl: 'postgresql://localhost:5432/analytics',
      tenantId,
      isActive: true,
    },
  });

  // Inactive data source for failure state
  await prisma.dataSource.create({
    data: {
      name: 'Legacy MySQL',
      type: 'MYSQL',
      connectionUrl: 'mysql://localhost:3306/legacy',
      tenantId,
      isActive: false,
    },
  });

  // Seed widget
  await prisma.widget.create({
    data: {
      title: 'Revenue Chart',
      type: 'CHART',
      config: JSON.stringify({ chartType: 'line', xAxis: 'date', yAxis: 'revenue' }),
      position: 0,
      tenantId,
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
    },
  });

  // Seed metric
  await prisma.metric.create({
    data: {
      name: 'monthly_revenue',
      value: 150000.50,
      unit: 'USD',
      tenantId,
      dataSourceId: dataSource.id,
    },
  });

  // Error/failure state metric with zero value
  await prisma.metric.create({
    data: {
      name: 'error_rate',
      value: 0.00,
      unit: 'percent',
      tenantId,
    },
  });

  // Log seeded entities
  const counts = {
    users: await prisma.user.count(),
    dashboards: await prisma.dashboard.count(),
    widgets: await prisma.widget.count(),
    dataSources: await prisma.dataSource.count(),
    metrics: await prisma.metric.count(),
  };

  process.stdout.write(`Seed complete: ${JSON.stringify(counts)}\n`);
  process.stdout.write(`Admin: ${admin.email}, Viewer: ${viewer.email}\n`);
}

main()
  .catch((error: Error) => {
    process.stderr.write(`Seed error: ${error.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
