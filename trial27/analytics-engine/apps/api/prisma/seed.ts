import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenant = await prisma.tenant.create({
    data: {
      id: 'tenant-seed-001',
      name: 'Acme Analytics',
      tier: 'PRO',
    },
  });

  const hashedPassword = await bcrypt.hash('password123', 12);

  await prisma.user.create({
    data: {
      id: 'user-seed-001',
      email: 'admin@acme.com',
      password: hashedPassword,
      name: 'Admin User',
      tenantId: tenant.id,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      id: 'dash-seed-001',
      tenantId: tenant.id,
      name: 'Sales Overview',
      description: 'Key sales metrics and trends',
      status: 'PUBLISHED',
      layout: 'grid',
      publishedAt: new Date(),
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      id: 'ds-seed-001',
      tenantId: tenant.id,
      name: 'Sales API',
      type: 'REST_API',
      status: 'ACTIVE',
    },
  });

  await prisma.widget.create({
    data: {
      id: 'widget-seed-001',
      dashboardId: dashboard.id,
      name: 'Revenue Trend',
      type: 'LINE_CHART',
      config: { metric: 'revenue', period: 'monthly' },
      positionX: 0,
      positionY: 0,
      width: 6,
      height: 4,
      dataSourceId: dataSource.id,
    },
  });

  await prisma.widget.create({
    data: {
      id: 'widget-seed-002',
      dashboardId: dashboard.id,
      name: 'Active Users',
      type: 'KPI_CARD',
      config: { metric: 'active_users' },
      positionX: 6,
      positionY: 0,
      width: 3,
      height: 2,
    },
  });

  await prisma.syncRun.create({
    data: {
      id: 'sync-seed-001',
      dataSourceId: dataSource.id,
      status: 'COMPLETED',
      rowsIngested: 1500,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'audit-seed-001',
      tenantId: tenant.id,
      action: 'CREATE',
      entity: 'Dashboard',
      entityId: dashboard.id,
      userId: 'user-seed-001',
    },
  });

  console.info('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
