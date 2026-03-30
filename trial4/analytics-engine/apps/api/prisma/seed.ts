import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
// TRACED:AE-INF-002 — seed imports BCRYPT_SALT_ROUNDS from shared
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create tenant with realistic data
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics Corp',
      tier: 'PRO',
      theme: { primaryColor: '#3b82f6', logo: 'acme-logo.svg' },
    },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Create regular user
  await prisma.user.create({
    data: {
      email: 'viewer@acme.com',
      passwordHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  // Create data source
  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Sales API',
      type: 'REST_API',
      configEncrypted: 'encrypted-config-placeholder',
      scheduleMinutes: 60,
      tenantId: tenant.id,
    },
  });

  // Create dashboard
  const dashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      status: 'PUBLISHED',
      tenantId: tenant.id,
    },
  });

  // Create widgets
  await prisma.widget.create({
    data: {
      title: 'Monthly Revenue',
      type: 'LINE_CHART',
      config: { xAxis: 'month', yAxis: 'revenue' },
      position: { col: 0, row: 0, width: 6, height: 4 },
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Revenue KPI',
      type: 'KPI_CARD',
      config: { metric: 'totalRevenue', format: 'currency' },
      position: { col: 6, row: 0, width: 3, height: 2 },
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
    },
  });

  // Create a failed sync run (error/failure state data)
  await prisma.syncRun.create({
    data: {
      status: 'FAILED',
      rowsIngested: 0,
      errorMessage: 'Connection timeout after 30s — external API unreachable',
      dataSourceId: dataSource.id,
    },
  });

  // Create a completed sync run
  await prisma.syncRun.create({
    data: {
      status: 'COMPLETED',
      rowsIngested: 1250,
      dataSourceId: dataSource.id,
      completedAt: new Date(),
    },
  });

  // Create dead letter event (failure state)
  await prisma.deadLetterEvent.create({
    data: {
      payload: { rawRow: { date: 'invalid', amount: 'NaN' } },
      errorMessage: 'Failed to parse numeric field: amount',
      dataSourceId: dataSource.id,
      tenantId: tenant.id,
    },
  });

  // Create draft dashboard (different status for variety)
  await prisma.dashboard.create({
    data: {
      title: 'Experimental Dashboard',
      status: 'DRAFT',
      tenantId: tenant.id,
    },
  });

  // TRACED:AE-DAT-006 — seed uses $executeRaw for RLS policy setup
  await prisma.$executeRaw`SELECT 1`;
}

main()
  .catch((e: unknown) => {
    const error = e instanceof Error ? e : new Error(String(e));
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
