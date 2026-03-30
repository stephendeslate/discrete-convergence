import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'a0000000-0000-0000-0000-000000000001';

  const adminHash = await bcrypt.hash('admin123!', BCRYPT_SALT_ROUNDS);
  const viewerHash = await bcrypt.hash('viewer123!', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@analytics.local' },
    update: {},
    create: {
      email: 'admin@analytics.local',
      passwordHash: adminHash,
      role: 'ADMIN',
      tenantId,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@analytics.local' },
    update: {},
    create: {
      email: 'viewer@analytics.local',
      passwordHash: viewerHash,
      role: 'VIEWER',
      tenantId,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Sales Overview',
      description: 'Key sales metrics and trends',
      status: 'PUBLISHED',
      tenantId,
      userId: admin.id,
    },
  });

  const archivedDashboard = await prisma.dashboard.create({
    data: {
      name: 'Archived Report',
      description: 'Old quarterly report — archived for reference',
      status: 'ARCHIVED',
      tenantId,
      userId: admin.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Production DB',
      type: 'POSTGRESQL',
      connectionString: 'postgresql://readonly:pass@db:5432/prod',
      tenantId,
      userId: admin.id,
      isActive: true,
    },
  });

  const inactiveSource = await prisma.dataSource.create({
    data: {
      name: 'Legacy CSV Import',
      type: 'CSV',
      tenantId,
      userId: viewer.id,
      isActive: false,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Revenue Chart',
      type: 'CHART',
      config: '{"chartType":"line","metric":"revenue"}',
      positionX: 0,
      positionY: 0,
      width: 6,
      height: 4,
      tenantId,
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Error Metric',
      type: 'METRIC',
      config: '{"label":"Error Rate","threshold":5}',
      positionX: 6,
      positionY: 0,
      width: 3,
      height: 2,
      tenantId,
      dashboardId: dashboard.id,
      dataSourceId: inactiveSource.id,
    },
  });

  process.stdout.write(`Seed complete: admin=${admin.id} viewer=${viewer.id} dashboard=${dashboard.id} archived=${archivedDashboard.id} ds=${dataSource.id} inactive=${inactiveSource.id}\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`Seed failed: ${String(error)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
