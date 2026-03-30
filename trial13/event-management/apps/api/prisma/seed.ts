import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
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

  const venue = await prisma.venue.create({
    data: {
      name: 'Main Conference Hall',
      address: '123 Event Street, City, ST 12345',
      capacity: 500,
      tenantId: tenant.id,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Annual Tech Conference',
      description: 'A premier technology conference',
      startDate: new Date('2025-06-01T09:00:00Z'),
      endDate: new Date('2025-06-01T17:00:00Z'),
      status: 'PUBLISHED',
      price: 99.99,
      capacity: 200,
      tenantId: tenant.id,
      venueId: venue.id,
    },
  });

  // Error/failure state data
  await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled due to low enrollment',
      startDate: new Date('2025-03-01T10:00:00Z'),
      endDate: new Date('2025-03-01T12:00:00Z'),
      status: 'CANCELLED',
      price: 25.00,
      capacity: 30,
      tenantId: tenant.id,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Draft Meetup',
      description: 'Still in planning phase',
      startDate: new Date('2025-09-15T18:00:00Z'),
      endDate: new Date('2025-09-15T20:00:00Z'),
      status: 'DRAFT',
      price: 0,
      capacity: 50,
      tenantId: tenant.id,
    },
  });

  const attendee = await prisma.attendee.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1-555-0100',
      tenantId: tenant.id,
    },
  });

  await prisma.registration.create({
    data: {
      status: 'CONFIRMED',
      eventId: (await prisma.event.findFirst({ where: { status: 'PUBLISHED', tenantId: tenant.id } }))!.id,
      attendeeId: attendee.id,
      tenantId: tenant.id,
    },
  });

  // Cancelled registration for error state
  await prisma.registration.create({
    data: {
      status: 'CANCELLED',
      eventId: (await prisma.event.findFirst({ where: { status: 'CANCELLED', tenantId: tenant.id } }))!.id,
      attendeeId: attendee.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Seed error: ${message}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
