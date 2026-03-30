// TRACED:AE-SEED-001 — seed with error handling and shared imports
// TRACED:AE-RLS-001 — exercises RLS migration
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics',
      tier: 'PRO',
      domain: 'acme.example.com',
      primaryColor: '#3B82F6',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.example.com',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@acme.example.com',
      passwordHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Monthly sales metrics and KPIs',
      status: 'PUBLISHED',
      tenantId: tenant.id,
    },
  });

  // Error/failure state data: archived dashboard
  await prisma.dashboard.create({
    data: {
      title: 'Deprecated Metrics',
      description: 'Old metrics no longer tracked',
      status: 'ARCHIVED',
      tenantId: tenant.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Sales API',
      type: 'REST_API',
      configEncrypted: 'encrypted:aes-256-gcm:placeholder',
      schedule: 'DAILY',
      tenantId: tenant.id,
    },
  });

  // Error/failure state data: paused data source with failures
  await prisma.dataSource.create({
    data: {
      name: 'Broken CSV Import',
      type: 'CSV',
      configEncrypted: 'encrypted:aes-256-gcm:placeholder',
      schedule: 'MANUAL',
      paused: true,
      consecutiveFailures: 5,
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Monthly Revenue',
      type: 'LINE_CHART',
      config: { xAxis: 'month', yAxis: 'revenue' },
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Total Revenue',
      type: 'KPI_CARD',
      config: { metric: 'totalRevenue', format: 'currency' },
      gridColumn: 7,
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
    },
  });

  // Error/failure state data: failed sync run
  await prisma.syncRun.create({
    data: {
      status: 'FAILED',
      rowsIngested: 0,
      errorMessage: 'Connection timeout after 30s',
      dataSourceId: dataSource.id,
    },
  });

  await prisma.syncRun.create({
    data: {
      status: 'COMPLETED',
      rowsIngested: 150,
      completedAt: new Date(),
      dataSourceId: dataSource.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'Dashboard',
      entityId: dashboard.id,
      userId: adminUser.id,
      tenantId: tenant.id,
      metadata: { title: 'Sales Overview' },
    },
  });

  // Error/failure state data: dead letter event
  await prisma.deadLetterEvent.create({
    data: {
      payload: { row: { amount: 'not-a-number' } },
      errorMessage: 'Failed to parse amount field as numeric',
      retryCount: 3,
      dataSourceId: dataSource.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
