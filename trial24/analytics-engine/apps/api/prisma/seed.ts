// TRACED:DB-SEED — Seeds database with initial test data
import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);

    const admin = await tx.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        passwordHash,
        role: 'ADMIN',
        tenantId,
      },
    });

    const viewer = await tx.user.upsert({
      where: { email: 'viewer@example.com' },
      update: {},
      create: {
        email: 'viewer@example.com',
        passwordHash,
        role: 'VIEWER',
        tenantId,
      },
    });

    const dashboard = await tx.dashboard.create({
      data: {
        name: 'Sales Overview',
        description: 'Main sales dashboard',
        isPublic: false,
        userId: admin.id,
        tenantId,
      },
    });

    await tx.widget.create({
      data: {
        title: 'Revenue Chart',
        type: 'line-chart',
        config: { metric: 'revenue', period: 'monthly' },
        position: 0,
        dashboardId: dashboard.id,
        tenantId,
      },
    });

    await tx.dataSource.create({
      data: {
        name: 'Production Database',
        type: 'postgresql',
        connectionString: 'postgresql://localhost:5432/prod',
        tenantId,
      },
    });

    process.stdout.write(`Seeded: admin=${admin.id}, viewer=${viewer.id}, dashboard=${dashboard.id}\n`);
  });
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${String(e)}\n`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
