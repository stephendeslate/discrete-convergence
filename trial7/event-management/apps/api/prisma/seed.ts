import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

// TRACED:EM-INFRA-002
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenant = await prisma.tenant.create({
    data: { name: 'Demo Org', slug: 'demo-org' },
  });

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.org',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@demo.org',
      passwordHash,
      name: 'Organizer User',
      role: 'ORGANIZER',
      tenantId: tenant.id,
    },
  });

  // Standard user
  await prisma.user.create({
    data: {
      email: 'user@demo.org',
      passwordHash,
      name: 'Regular User',
      role: 'USER',
      tenantId: tenant.id,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Main Hall',
      address: '123 Event St',
      city: 'Eventville',
      capacity: 500,
      tenantId: tenant.id,
    },
  });

  const category = await prisma.category.create({
    data: {
      name: 'Conference',
      description: 'Professional conferences and meetups',
      tenantId: tenant.id,
    },
  });

  // Published event
  await prisma.event.create({
    data: {
      title: 'Tech Summit 2025',
      description: 'Annual technology conference',
      startDate: new Date('2025-06-15T09:00:00Z'),
      endDate: new Date('2025-06-15T17:00:00Z'),
      status: 'PUBLISHED',
      price: 99.99,
      capacity: 200,
      organizerId: organizer.id,
      venueId: venue.id,
      categoryId: category.id,
      tenantId: tenant.id,
    },
  });

  // Cancelled event (error/failure state data)
  await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled due to low registration',
      startDate: new Date('2025-07-01T09:00:00Z'),
      endDate: new Date('2025-07-01T12:00:00Z'),
      status: 'CANCELLED',
      price: 0,
      capacity: 50,
      organizerId: organizer.id,
      venueId: venue.id,
      categoryId: category.id,
      tenantId: tenant.id,
    },
  });

  // Audit log entry
  await prisma.auditLog.create({
    data: {
      action: 'LOGIN',
      entity: 'User',
      entityId: admin.id,
      details: 'Admin login during seed',
      userId: admin.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
