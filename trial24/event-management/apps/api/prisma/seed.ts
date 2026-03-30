// TRACED:SEED
import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const orgId = '00000000-0000-0000-0000-000000000001';
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT set_config('app.organization_id', ${orgId}, true)`);

    await tx.user.upsert({
      where: { email_organizationId: { email: 'admin@example.com', organizationId: orgId } },
      update: {},
      create: {
        email: 'admin@example.com',
        passwordHash,
        role: 'ADMIN',
        organizationId: orgId,
      },
    });

    const venue = await tx.venue.create({
      data: {
        name: 'Main Convention Center',
        address: '123 Event Street, City, ST 12345',
        capacity: 5000,
        organizationId: orgId,
      },
    });

    await tx.event.create({
      data: {
        title: 'Annual Tech Conference',
        description: 'Our flagship technology conference',
        startDate: new Date('2024-06-15T09:00:00Z'),
        endDate: new Date('2024-06-17T17:00:00Z'),
        status: 'PUBLISHED',
        venueId: venue.id,
        organizationId: orgId,
      },
    });
  });
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${String(e)}\n`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
