// TRACED:AE-SEED-001 — Seed with error handling and shared imports
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create tenants
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme-analytics' },
    update: {},
    create: {
      name: 'Acme Analytics',
      slug: 'acme-analytics',
      tier: 'PRO',
      primaryColor: '#3B82F6',
    },
  });

  const failedTenant = await prisma.tenant.upsert({
    where: { slug: 'failed-corp' },
    update: {},
    create: {
      name: 'Failed Corp',
      slug: 'failed-corp',
      tier: 'FREE',
    },
  });

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@acme.com' },
    update: {},
    create: {
      email: 'viewer@acme.com',
      passwordHash,
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  // Create dashboards with different statuses
  const publishedDashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Real-time sales metrics and KPIs',
      status: 'PUBLISHED',
      tenantId: tenant.id,
    },
  });

  const draftDashboard = await prisma.dashboard.create({
    data: {
      title: 'Draft Dashboard',
      description: 'Work in progress',
      status: 'DRAFT',
      tenantId: tenant.id,
    },
  });

  // TRACED:AE-SEED-002 — Seed includes error/failure state data
  const archivedDashboard = await prisma.dashboard.create({
    data: {
      title: 'Archived Q1 Report',
      description: 'Archived quarterly report',
      status: 'ARCHIVED',
      tenantId: tenant.id,
    },
  });

  // Create data sources
  const restDs = await prisma.dataSource.create({
    data: {
      name: 'Sales API',
      connectorType: 'REST_API',
      configEncrypted: 'encrypted-config-placeholder',
      syncSchedule: 'HOURLY',
      tenantId: tenant.id,
    },
  });

  // Create a failed data source (error state)
  const failedDs = await prisma.dataSource.create({
    data: {
      name: 'Broken Webhook',
      connectorType: 'WEBHOOK',
      configEncrypted: 'encrypted-config-placeholder',
      syncSchedule: 'MANUAL',
      isActive: false,
      failureCount: 5,
      tenantId: tenant.id,
    },
  });

  // Create widgets
  await prisma.widget.create({
    data: {
      title: 'Revenue Trend',
      chartType: 'LINE',
      gridColumn: 0,
      gridRow: 0,
      gridWidth: 6,
      gridHeight: 4,
      dashboardId: publishedDashboard.id,
      dataSourceId: restDs.id,
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Top Products',
      chartType: 'BAR',
      gridColumn: 6,
      gridRow: 0,
      gridWidth: 6,
      gridHeight: 4,
      dashboardId: publishedDashboard.id,
      dataSourceId: restDs.id,
      tenantId: tenant.id,
    },
  });

  // Create sync runs including failure state
  await prisma.syncRun.create({
    data: {
      status: 'COMPLETED',
      rowsIngested: 1500,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3540000),
      dataSourceId: restDs.id,
      tenantId: tenant.id,
    },
  });

  await prisma.syncRun.create({
    data: {
      status: 'FAILED',
      errorMessage: 'Connection timeout after 30s',
      startedAt: new Date(Date.now() - 7200000),
      dataSourceId: failedDs.id,
      tenantId: tenant.id,
    },
  });

  // Create dead letter event (error state)
  await prisma.deadLetterEvent.create({
    data: {
      payload: { row: 42, value: 'invalid-date' },
      errorMessage: 'Failed to parse timestamp field',
      dataSourceId: failedDs.id,
      tenantId: tenant.id,
    },
  });

  // Create audit log entries
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'Dashboard',
      entityId: publishedDashboard.id,
      details: { title: 'Sales Overview' },
      userId: admin.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .then(() => {
    return prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    return prisma.$disconnect().then(() => {
      process.exit(1);
    });
  });
