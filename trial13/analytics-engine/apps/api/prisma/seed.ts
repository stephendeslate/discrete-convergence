// TRACED: AE-INFRA-003
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Tenant',
    },
  });

  const adminPasswordHash = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
  const viewerPasswordHash = await bcrypt.hash('viewer123', BCRYPT_SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@demo.com',
      passwordHash: viewerPasswordHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Monthly sales metrics dashboard',
      status: 'PUBLISHED',
      tenantId: tenant.id,
    },
  });

  // Error/failure state data for testing
  await prisma.dashboard.create({
    data: {
      title: 'Archived Dashboard',
      description: 'This dashboard has been archived',
      status: 'ARCHIVED',
      tenantId: tenant.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Main PostgreSQL',
      type: 'POSTGRESQL',
      connectionInfo: { host: 'localhost', port: 5432, database: 'sales' },
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Revenue Chart',
      type: 'LINE_CHART',
      config: { xAxis: 'month', yAxis: 'revenue' },
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Sales by Region',
      type: 'PIE_CHART',
      config: { groupBy: 'region' },
      dashboardId: dashboard.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
