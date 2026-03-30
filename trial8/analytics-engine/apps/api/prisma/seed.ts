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
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@demo.analytics.local',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'analyst@demo.analytics.local',
      passwordHash,
      role: 'ANALYST',
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
      type: 'CHART',
      title: 'Revenue Trend',
      config: { timeRange: '30d', metric: 'revenue' },
      position: 0,
      dashboardId: dashboard.id,
    },
  });

  await prisma.widget.create({
    data: {
      type: 'METRIC',
      title: 'Total Users',
      config: { metric: 'user_count' },
      position: 1,
      dashboardId: dashboard.id,
    },
  });

  await prisma.dataSource.create({
    data: {
      name: 'Sales Database',
      type: 'POSTGRES',
      connectionString: 'postgresql://readonly:pass@db:5432/sales',
      status: 'ACTIVE',
      tenantId: tenant.id,
    },
  });

  // Seed failure state data for testing error scenarios
  await prisma.dataSource.create({
    data: {
      name: 'Broken CSV Import',
      type: 'CSV',
      status: 'ERROR',
      tenantId: tenant.id,
    },
  });

  // Archived dashboard for testing status filtering
  await prisma.dashboard.create({
    data: {
      title: 'Deprecated Q1 Report',
      description: 'No longer maintained',
      status: 'ARCHIVED',
      tenantId: tenant.id,
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
