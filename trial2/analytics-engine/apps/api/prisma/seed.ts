import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED:AE-INFRA-001 — Seed with error handling, BCRYPT_SALT_ROUNDS from shared, error state data
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Tenant',
      tier: 'PRO',
    },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Create viewer user
  await prisma.user.create({
    data: {
      email: 'viewer@demo.com',
      passwordHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  // Create dashboards with various statuses
  const publishedDashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Key sales metrics and trends',
      status: 'PUBLISHED',
      tenantId: tenant.id,
    },
  });

  const draftDashboard = await prisma.dashboard.create({
    data: {
      title: 'Marketing Analytics',
      description: 'Campaign performance dashboard',
      status: 'DRAFT',
      tenantId: tenant.id,
    },
  });

  // Archived dashboard (error state variant)
  await prisma.dashboard.create({
    data: {
      title: 'Legacy Dashboard',
      description: 'Archived for historical reference',
      status: 'ARCHIVED',
      tenantId: tenant.id,
    },
  });

  // Create data sources
  const restSource = await prisma.dataSource.create({
    data: {
      name: 'Sales API',
      type: 'REST_API',
      tenantId: tenant.id,
    },
  });

  const csvSource = await prisma.dataSource.create({
    data: {
      name: 'CSV Import',
      type: 'CSV',
      tenantId: tenant.id,
    },
  });

  // Create widgets
  await prisma.widget.create({
    data: {
      title: 'Revenue Trend',
      type: 'LINE_CHART',
      positionX: 0,
      positionY: 0,
      width: 2,
      height: 1,
      dashboardId: publishedDashboard.id,
      dataSourceId: restSource.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Sales by Region',
      type: 'BAR_CHART',
      positionX: 2,
      positionY: 0,
      width: 1,
      height: 1,
      dashboardId: publishedDashboard.id,
      dataSourceId: restSource.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Draft KPI',
      type: 'KPI_CARD',
      positionX: 0,
      positionY: 0,
      width: 1,
      height: 1,
      dashboardId: draftDashboard.id,
    },
  });

  // Create sync runs including error states
  await prisma.syncRun.create({
    data: {
      status: 'COMPLETED',
      rowsIngested: 150,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3500000),
      dataSourceId: restSource.id,
    },
  });

  // Error state: failed sync run
  await prisma.syncRun.create({
    data: {
      status: 'FAILED',
      rowsIngested: 0,
      errorMessage: 'Connection timeout after 30s',
      startedAt: new Date(Date.now() - 7200000),
      completedAt: new Date(Date.now() - 7100000),
      dataSourceId: restSource.id,
    },
  });

  // Error state: stuck sync run (running too long)
  await prisma.syncRun.create({
    data: {
      status: 'RUNNING',
      rowsIngested: 0,
      startedAt: new Date(Date.now() - 86400000),
      dataSourceId: csvSource.id,
    },
  });

  // Create dead letter event (error state data)
  await prisma.deadLetterEvent.create({
    data: {
      payload: { row: 42, value: 'invalid-date' },
      errorMessage: 'Failed to parse date field: invalid-date',
      retryCount: 3,
      dataSourceId: restSource.id,
      tenantId: tenant.id,
    },
  });

  // Create query cache with cost
  await prisma.queryCache.create({
    data: {
      queryHash: 'abc123hash',
      result: { data: [{ month: 'Jan', revenue: 50000 }] },
      ttlSeconds: 300,
      cost: 0.05,
      dataSourceId: restSource.id,
      expiresAt: new Date(Date.now() + 300000),
    },
  });

  // Create audit log entries
  await prisma.auditLog.create({
    data: {
      action: 'dashboard.publish',
      entity: 'Dashboard',
      entityId: publishedDashboard.id,
      details: { title: 'Sales Overview' },
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
