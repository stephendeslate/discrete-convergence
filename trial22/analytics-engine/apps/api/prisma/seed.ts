import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.upsert({
    where: { id: 'seed-tenant-1' },
    update: {},
    create: {
      id: 'seed-tenant-1',
      name: 'Seed Tenant',
      slug: 'seed-tenant',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const viewerPassword = await bcrypt.hash('Viewer123!', BCRYPT_SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      password: viewerPassword,
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const dataSource = await prisma.dataSource.upsert({
    where: { id: 'seed-ds-1' },
    update: {},
    create: {
      id: 'seed-ds-1',
      name: 'Sample PostgreSQL',
      type: 'postgresql',
      connectionString: 'postgresql://localhost:5432/sample',
      tenantId: tenant.id,
    },
  });

  await prisma.dashboard.upsert({
    where: { id: 'seed-dashboard-1' },
    update: {},
    create: {
      id: 'seed-dashboard-1',
      title: 'Sales Overview',
      description: 'Key sales metrics and KPIs',
      status: 'PUBLISHED',
      tenantId: tenant.id,
      userId: 'seed-tenant-1',
    },
  });

  // Error/failure state data for testing
  await prisma.alert.upsert({
    where: { id: 'seed-alert-failed' },
    update: {},
    create: {
      id: 'seed-alert-failed',
      title: 'Connection Failure',
      message: 'Data source connection timed out after 30s',
      severity: 'CRITICAL',
      resolved: false,
      tenantId: tenant.id,
    },
  });

  await prisma.schedule.upsert({
    where: { id: 'seed-schedule-1' },
    update: {},
    create: {
      id: 'seed-schedule-1',
      name: 'Daily Report',
      frequency: 'DAILY',
      enabled: true,
      tenantId: tenant.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
