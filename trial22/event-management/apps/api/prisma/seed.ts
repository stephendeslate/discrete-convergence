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
    where: { email_tenantId: { email: 'admin@example.com', tenantId: tenant.id } },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const userPassword = await bcrypt.hash('User123!', BCRYPT_SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email_tenantId: { email: 'user@example.com', tenantId: tenant.id } },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      role: 'USER',
      tenantId: tenant.id,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Main Conference Hall',
      address: '123 Event Street',
      city: 'San Francisco',
      capacity: 500,
      tenantId: tenant.id,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Annual Tech Conference 2026',
      description: 'A premier technology conference',
      status: 'PUBLISHED',
      startDate: new Date('2026-06-01T09:00:00Z'),
      endDate: new Date('2026-06-03T17:00:00Z'),
      capacity: 500,
      tenantId: tenant.id,
      venueId: venue.id,
    },
  });

  // Error/failure state data
  await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled due to low registration',
      status: 'CANCELLED',
      startDate: new Date('2026-04-01T09:00:00Z'),
      endDate: new Date('2026-04-01T17:00:00Z'),
      capacity: 50,
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
