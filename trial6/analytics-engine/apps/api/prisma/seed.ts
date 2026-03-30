import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Create demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Organization',
      domain: 'demo.analytics-engine.local',
      tier: 'PRO',
      theme: { primaryColor: '#3b82f6', darkMode: true },
    },
  });

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123456', 12);
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Create viewer user
  const viewerPasswordHash = await bcrypt.hash('viewer123456', 12);
  await prisma.user.create({
    data: {
      email: 'viewer@demo.com',
      passwordHash: viewerPasswordHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  // Create dashboards
  const dashboard1 = await prisma.dashboard.create({
    data: {
      title: 'Revenue Overview',
      description: 'Monthly revenue metrics and trends',
      status: 'PUBLISHED',
      tenantId: tenant.id,
    },
  });

  const dashboard2 = await prisma.dashboard.create({
    data: {
      title: 'User Engagement',
      description: 'User activity and retention analysis',
      status: 'DRAFT',
      tenantId: tenant.id,
    },
  });

  // Create widgets for dashboard1
  await prisma.widget.createMany({
    data: [
      {
        type: 'LINE',
        title: 'Monthly Revenue',
        config: { yAxis: 'revenue', xAxis: 'month', color: '#3b82f6' },
        dashboardId: dashboard1.id,
      },
      {
        type: 'KPI',
        title: 'Total Revenue',
        config: { value: 'total_revenue', format: 'currency' },
        dashboardId: dashboard1.id,
      },
      {
        type: 'BAR',
        title: 'Revenue by Region',
        config: { groupBy: 'region', metric: 'revenue' },
        dashboardId: dashboard1.id,
      },
    ],
  });

  // Create widgets for dashboard2
  await prisma.widget.createMany({
    data: [
      {
        type: 'AREA',
        title: 'Daily Active Users',
        config: { metric: 'dau', period: '30d' },
        dashboardId: dashboard2.id,
      },
      {
        type: 'PIE',
        title: 'Users by Plan',
        config: { groupBy: 'plan', metric: 'count' },
        dashboardId: dashboard2.id,
      },
    ],
  });

  // Create data sources
  await prisma.dataSource.create({
    data: {
      name: 'Production PostgreSQL',
      type: 'POSTGRES',
      config: { host: 'db.example.com', port: 5432, database: 'production' },
      tenantId: tenant.id,
    },
  });

  await prisma.dataSource.create({
    data: {
      name: 'Sales API',
      type: 'REST_API',
      config: { url: 'https://api.example.com/sales', method: 'GET' },
      tenantId: tenant.id,
    },
  });

  // Create audit log entries
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'CREATE',
        entityType: 'Dashboard',
        entityId: dashboard1.id,
        tenantId: tenant.id,
        metadata: { title: 'Revenue Overview' },
      },
      {
        action: 'CREATE',
        entityType: 'Dashboard',
        entityId: dashboard2.id,
        tenantId: tenant.id,
        metadata: { title: 'User Engagement' },
      },
    ],
  });
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${e}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
