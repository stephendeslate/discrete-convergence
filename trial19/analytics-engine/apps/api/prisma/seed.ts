import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

// TRACED: AE-INFRA-002
async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Demo Organization',
    },
  });

  const adminHash = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
  const viewerHash = await bcrypt.hash('viewer123', BCRYPT_SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      passwordHash: viewerHash,
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Sales Overview',
      description: 'Main sales metrics dashboard',
      status: 'ACTIVE',
      tenantId: tenant.id,
    },
  });

  // Error state data — archived dashboard for testing
  await prisma.dashboard.create({
    data: {
      name: 'Deprecated Metrics',
      description: 'Archived dashboard for error state testing',
      status: 'ARCHIVED',
      tenantId: tenant.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Production Database',
      type: 'POSTGRESQL',
      connectionString: 'postgresql://readonly:pass@db:5432/analytics',
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'Revenue Chart',
      type: 'CHART',
      config: '{"chartType":"line","metric":"revenue"}',
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      name: 'User Count',
      type: 'METRIC',
      config: '{"metric":"user_count","format":"number"}',
      dashboardId: dashboard.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .then(() => {
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Seed error:', e);
    return prisma.$disconnect().then(() => {
      process.exit(1);
    });
  });
