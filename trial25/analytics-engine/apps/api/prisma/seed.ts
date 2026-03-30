// TRACED:SEED — Database seed script
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('admin123', 12);
  const tenantId = 'default-tenant';

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      tenantId,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Default Dashboard',
      description: 'A default dashboard for getting started',
      isPublic: false,
      tenantId,
      userId: admin.id,
    },
  });

  await prisma.widget.create({
    data: {
      title: 'Welcome Widget',
      type: 'text',
      config: { content: 'Welcome to Analytics Engine' },
      position: 0,
      dashboardId: dashboard.id,
      tenantId,
    },
  });

  await prisma.dataSource.create({
    data: {
      name: 'Sample PostgreSQL',
      type: 'postgresql',
      connectionString: 'postgresql://localhost:5432/sample',
      tenantId,
      isActive: true,
    },
  });
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${String(e)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
