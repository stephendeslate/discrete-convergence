import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics',
      slug: 'acme-analytics',
      theme: { primaryColor: '#2563eb', logoUrl: '/logos/acme.png' },
      tier: 'PRO',
      billingEmail: 'billing@acme.example.com',
      monthlyBudget: 499.99,
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Globex Corporation',
      slug: 'globex-corp',
      theme: { primaryColor: '#dc2626', logoUrl: '/logos/globex.png' },
      tier: 'ENTERPRISE',
      billingEmail: 'finance@globex.example.com',
      monthlyBudget: 1999.00,
    },
  });

  const passwordHash = await bcrypt.hash('Password123!', BCRYPT_SALT_ROUNDS);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.example.com',
      passwordHash,
      name: 'Alice Admin',
      role: 'ADMIN',
      tenantId: tenant1.id,
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@acme.example.com',
      passwordHash,
      name: 'Edward Editor',
      role: 'EDITOR',
      tenantId: tenant1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@acme.example.com',
      passwordHash,
      name: 'Vera Viewer',
      role: 'VIEWER',
      tenantId: tenant1.id,
    },
  });

  const globexAdmin = await prisma.user.create({
    data: {
      email: 'admin@globex.example.com',
      passwordHash,
      name: 'Hank Scorpio',
      role: 'ADMIN',
      tenantId: tenant2.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'analyst@globex.example.com',
      passwordHash,
      name: 'Gloria Analyst',
      role: 'EDITOR',
      tenantId: tenant2.id,
    },
  });

  const publishedDashboard = await prisma.dashboard.create({
    data: {
      name: 'Sales Overview',
      description: 'Real-time sales metrics and KPIs',
      status: 'PUBLISHED',
      tenantId: tenant1.id,
    },
  });

  const draftDashboard = await prisma.dashboard.create({
    data: {
      name: 'Marketing Funnel',
      description: 'Lead conversion tracking',
      status: 'DRAFT',
      tenantId: tenant1.id,
    },
  });

  await prisma.dashboard.create({
    data: {
      name: 'Q3 2025 Report',
      description: 'Archived quarterly report',
      status: 'ARCHIVED',
      tenantId: tenant1.id,
    },
  });

  const globexDashboard = await prisma.dashboard.create({
    data: {
      name: 'Operations Dashboard',
      description: 'Global operations monitoring',
      status: 'PUBLISHED',
      tenantId: tenant2.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Revenue Trend',
      type: 'LINE',
      config: { xAxis: 'date', yAxis: 'revenue', period: '30d' },
      position: 0,
      dashboardId: publishedDashboard.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Monthly Revenue',
      type: 'KPI',
      config: { metric: 'total_revenue', format: 'currency', target: 50000 },
      position: 1,
      dashboardId: publishedDashboard.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Sales by Region',
      type: 'BAR',
      config: { groupBy: 'region', metric: 'sales_count' },
      position: 2,
      dashboardId: publishedDashboard.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Lead Sources',
      type: 'PIE',
      config: { groupBy: 'source', metric: 'lead_count' },
      position: 0,
      dashboardId: draftDashboard.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Conversion Funnel',
      type: 'FUNNEL',
      config: { stages: ['visit', 'signup', 'trial', 'paid'] },
      position: 1,
      dashboardId: draftDashboard.id,
      tenantId: tenant1.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Throughput by Facility',
      type: 'AREA',
      config: { xAxis: 'hour', yAxis: 'units_processed', stacked: true },
      position: 0,
      dashboardId: globexDashboard.id,
      tenantId: tenant2.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Incident Log',
      type: 'TABLE',
      config: { columns: ['timestamp', 'facility', 'severity', 'description'], pageSize: 25 },
      position: 1,
      dashboardId: globexDashboard.id,
      tenantId: tenant2.id,
    },
  });

  const restSource = await prisma.dataSource.create({
    data: {
      name: 'Stripe API',
      type: 'REST',
      config: { baseUrl: 'https://api.stripe.com/v1', authType: 'bearer' },
      status: 'active',
      lastSyncAt: new Date('2026-03-24T14:30:00Z'),
      tenantId: tenant1.id,
    },
  });

  const pgSource = await prisma.dataSource.create({
    data: {
      name: 'Sales Database',
      type: 'POSTGRESQL',
      config: { host: 'db.internal', port: 5432, database: 'sales' },
      status: 'active',
      lastSyncAt: new Date('2026-03-25T08:00:00Z'),
      tenantId: tenant1.id,
    },
  });

  const csvSource = await prisma.dataSource.create({
    data: {
      name: 'Legacy CSV Import',
      type: 'CSV',
      config: { delimiter: ',', hasHeader: true },
      status: 'inactive',
      tenantId: tenant1.id,
    },
  });

  const webhookSource = await prisma.dataSource.create({
    data: {
      name: 'IoT Sensor Feed',
      type: 'WEBHOOK',
      config: { endpoint: '/webhooks/iot', secret: 'wh_sec_placeholder' },
      status: 'active',
      lastSyncAt: new Date('2026-03-25T10:15:00Z'),
      tenantId: tenant2.id,
    },
  });

  await prisma.syncHistory.create({
    data: {
      dataSourceId: restSource.id,
      status: 'COMPLETED',
      startedAt: new Date('2026-03-24T14:00:00Z'),
      completedAt: new Date('2026-03-24T14:30:00Z'),
      recordCount: 1542,
      tenantId: tenant1.id,
    },
  });

  await prisma.syncHistory.create({
    data: {
      dataSourceId: restSource.id,
      status: 'FAILED',
      startedAt: new Date('2026-03-23T14:00:00Z'),
      completedAt: new Date('2026-03-23T14:02:00Z'),
      recordCount: 0,
      errorMessage: 'HTTP 429: Rate limit exceeded. Retry after 60 seconds.',
      tenantId: tenant1.id,
    },
  });

  await prisma.syncHistory.create({
    data: {
      dataSourceId: pgSource.id,
      status: 'COMPLETED',
      startedAt: new Date('2026-03-25T07:30:00Z'),
      completedAt: new Date('2026-03-25T08:00:00Z'),
      recordCount: 28730,
      tenantId: tenant1.id,
    },
  });

  await prisma.syncHistory.create({
    data: {
      dataSourceId: csvSource.id,
      status: 'FAILED',
      startedAt: new Date('2026-03-20T09:00:00Z'),
      completedAt: new Date('2026-03-20T09:00:15Z'),
      recordCount: 0,
      errorMessage: 'Parse error at row 847: unexpected number of columns (expected 12, got 9)',
      tenantId: tenant1.id,
    },
  });

  await prisma.syncHistory.create({
    data: {
      dataSourceId: webhookSource.id,
      status: 'RUNNING',
      startedAt: new Date('2026-03-25T10:10:00Z'),
      tenantId: tenant2.id,
    },
  });

  await prisma.syncHistory.create({
    data: {
      dataSourceId: webhookSource.id,
      status: 'COMPLETED',
      startedAt: new Date('2026-03-25T09:00:00Z'),
      completedAt: new Date('2026-03-25T09:15:00Z'),
      recordCount: 4821,
      tenantId: tenant2.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Dashboard',
      entityId: publishedDashboard.id,
      userId: adminUser.id,
      metadata: { dashboardName: 'Sales Overview' },
      tenantId: tenant1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'Dashboard',
      entityId: publishedDashboard.id,
      userId: editorUser.id,
      metadata: { field: 'status', oldValue: 'DRAFT', newValue: 'PUBLISHED' },
      tenantId: tenant1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'DataSource',
      entityId: restSource.id,
      userId: adminUser.id,
      metadata: { dataSourceName: 'Stripe API', type: 'REST' },
      tenantId: tenant1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'DELETE',
      entityType: 'Widget',
      entityId: '00000000-0000-0000-0000-000000000000',
      userId: adminUser.id,
      metadata: { widgetName: 'Deprecated Chart', reason: 'No longer relevant' },
      tenantId: tenant1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Dashboard',
      entityId: globexDashboard.id,
      userId: globexAdmin.id,
      metadata: { dashboardName: 'Operations Dashboard' },
      tenantId: tenant2.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'SYNC_FAILED',
      entityType: 'DataSource',
      entityId: csvSource.id,
      userId: null,
      metadata: { error: 'Parse error at row 847', dataSourceName: 'Legacy CSV Import' },
      tenantId: tenant1.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
