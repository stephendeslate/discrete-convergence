import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED:AE-INFRA-002
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics',
      slug: 'acme-analytics',
    },
  });

  const passwordHash = await bcrypt.hash('admin123!', BCRYPT_SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const viewerHash = await bcrypt.hash('viewer123!', BCRYPT_SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: 'viewer@acme.com',
      passwordHash: viewerHash,
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      title: 'Sales Overview',
      description: 'Main sales metrics dashboard',
      status: 'ACTIVE',
      tenantId: tenant.id,
    },
  });

  // Error/failure state data
  await prisma.dashboard.create({
    data: {
      title: 'Failed Import Dashboard',
      description: 'Dashboard with error state for testing',
      status: 'ARCHIVED',
      tenantId: tenant.id,
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: 'Production DB',
      type: 'POSTGRESQL',
      connectionUrl: 'postgresql://readonly:pass@db:5432/prod',
      status: 'CONNECTED',
      tenantId: tenant.id,
    },
  });

  // Error state data source
  await prisma.dataSource.create({
    data: {
      name: 'Broken Integration',
      type: 'REST_API',
      connectionUrl: 'https://api.broken.example.com',
      status: 'ERROR',
      tenantId: tenant.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Revenue Chart',
      type: 'CHART',
      config: { chartType: 'line', metric: 'revenue' },
      dashboardId: dashboard.id,
      dataSourceId: dataSource.id,
      tenantId: tenant.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'LOGIN',
      entity: 'User',
      details: { ip: '127.0.0.1' },
      userId: (await prisma.user.findFirst({ where: { email: 'admin@acme.com' } }))!.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
