import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED: AE-INFRA-003 — Seed imports BCRYPT_SALT_ROUNDS from shared, creates tenant, admin, viewer, and error state data

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Organization',
    },
  });

  const adminPasswordHash = await bcrypt.hash('admin123!', BCRYPT_SALT_ROUNDS);
  const viewerPasswordHash = await bcrypt.hash('viewer123!', BCRYPT_SALT_ROUNDS);

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

  const publishedDashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Key sales metrics and trends',
      status: 'PUBLISHED',
      tenantId: tenant.id,
    },
  });

  // Error/failure state data - archived dashboard
  await prisma.dashboard.create({
    data: {
      title: 'Deprecated Report',
      description: 'This dashboard is no longer maintained',
      status: 'ARCHIVED',
      tenantId: tenant.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Production DB',
      type: 'POSTGRESQL',
      connectionInfo: { host: 'db.example.com', port: 5432, database: 'prod' },
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Revenue Chart',
      type: 'LINE_CHART',
      config: { xAxis: 'date', yAxis: 'revenue' },
      dashboardId: publishedDashboard.id,
      dataSourceId: dataSource.id,
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Sales by Region',
      type: 'BAR_CHART',
      config: { groupBy: 'region' },
      dashboardId: publishedDashboard.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
