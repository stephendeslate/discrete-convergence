// TRACED:AE-DATA-008 — Seed with error handling, BCRYPT_SALT_ROUNDS from shared, failure state data
// TRACED:AE-DATA-005 — Seed exercises RLS migration by inserting tenant-scoped data
// TRACED:AE-CROSS-004 — Shared package consumed: BCRYPT_SALT_ROUNDS import
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Analytics Corp',
      domain: 'demo.analytics.local',
      tier: 'PRO',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'admin@demo.analytics.local',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Monthly sales metrics and trends',
      status: 'PUBLISHED',
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      type: 'LINE',
      title: 'Revenue Trend',
      config: { timeRange: '30d', metric: 'revenue' },
      dashboardId: dashboard.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Sales API',
      type: 'REST_API',
      tenantId: tenant.id,
    },
  });

  await prisma.syncRun.create({
    data: {
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3500000),
      rowsIngested: 1500,
      dataSourceId: dataSource.id,
    },
  });

  // Seed failure state data for testing error scenarios
  await prisma.syncRun.create({
    data: {
      status: 'FAILED',
      startedAt: new Date(Date.now() - 7200000),
      completedAt: new Date(Date.now() - 7100000),
      rowsIngested: 0,
      errorMessage: 'Connection timeout after 30s',
      dataSourceId: dataSource.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'SEED',
      entityType: 'SYSTEM',
      entityId: 'seed',
      tenantId: tenant.id,
      userId: user.id,
      metadata: { seededAt: new Date().toISOString() },
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
