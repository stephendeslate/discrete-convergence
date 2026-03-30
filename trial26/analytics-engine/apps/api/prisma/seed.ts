import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      id: 'tenant-001',
      name: 'Acme Analytics',
      tier: 'PRO',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.user.create({
    data: {
      id: 'user-001',
      email: 'admin@acme.com',
      password: passwordHash,
      name: 'Admin User',
      tenantId: tenant.id,
      role: 'ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      id: 'user-002',
      email: 'member@acme.com',
      password: passwordHash,
      name: 'Member User',
      tenantId: tenant.id,
      role: 'MEMBER',
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      id: 'dash-001',
      tenantId: tenant.id,
      name: 'Sales Overview',
      description: 'Monthly sales metrics and trends',
      status: 'PUBLISHED',
      layout: 'grid',
      publishedAt: new Date(),
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      id: 'ds-001',
      tenantId: tenant.id,
      name: 'Sales API',
      type: 'REST_API',
      connectionConfig: '{"url":"https://api.example.com/sales","method":"GET"}',
      status: 'ACTIVE',
      syncSchedule: '0 * * * *',
    },
  });

  await prisma.widget.create({
    data: {
      id: 'widget-001',
      dashboardId: dashboard.id,
      name: 'Monthly Revenue',
      type: 'LINE_CHART',
      config: '{"xAxis":"month","yAxis":"revenue"}',
      positionX: 0,
      positionY: 0,
      width: 6,
      height: 4,
      dataSourceId: dataSource.id,
    },
  });

  await prisma.widget.create({
    data: {
      id: 'widget-002',
      dashboardId: dashboard.id,
      name: 'Sales by Region',
      type: 'BAR_CHART',
      config: '{"xAxis":"region","yAxis":"sales"}',
      positionX: 6,
      positionY: 0,
      width: 6,
      height: 4,
      dataSourceId: dataSource.id,
    },
  });

  await prisma.syncHistory.create({
    data: {
      id: 'sync-001',
      dataSourceId: dataSource.id,
      status: 'COMPLETED',
      recordsProcessed: 150,
      completedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'audit-001',
      tenantId: tenant.id,
      userId: 'user-001',
      action: 'CREATE',
      entity: 'Dashboard',
      entityId: dashboard.id,
      metadata: '{"name":"Sales Overview"}',
    },
  });

  console.info('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
