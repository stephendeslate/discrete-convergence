// TRACED: EM-INFRA-005 — Seed with error handling and BCRYPT_SALT_ROUNDS from shared
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      tenantId,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@example.com',
      passwordHash,
      role: 'ORGANIZER',
      tenantId,
    },
  });

  const attendee = await prisma.user.create({
    data: {
      email: 'attendee@example.com',
      passwordHash,
      role: 'ATTENDEE',
      tenantId,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Conference Center',
      address: '123 Main St, New York, NY 10001',
      capacity: 500,
      tenantId,
    },
  });

  const event = await prisma.event.create({
    data: {
      title: 'Annual Tech Conference',
      description: 'A conference for technology professionals',
      startDate: new Date('2025-06-01T09:00:00Z'),
      endDate: new Date('2025-06-01T17:00:00Z'),
      status: 'PUBLISHED',
      tenantId,
      venueId: venue.id,
    },
  });

  // Cancelled event for error/failure state data
  const cancelledEvent = await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled',
      startDate: new Date('2025-01-01T09:00:00Z'),
      endDate: new Date('2025-01-01T12:00:00Z'),
      status: 'CANCELLED',
      tenantId,
      venueId: venue.id,
    },
  });

  await prisma.ticket.create({
    data: {
      name: 'General Admission',
      price: 99.99,
      quantity: 100,
      sold: 25,
      status: 'AVAILABLE',
      eventId: event.id,
      tenantId,
    },
  });

  // Sold out ticket for failure state
  await prisma.ticket.create({
    data: {
      name: 'VIP Pass',
      price: 299.99,
      quantity: 10,
      sold: 10,
      status: 'SOLD',
      eventId: event.id,
      tenantId,
    },
  });

  // Cancelled ticket
  await prisma.ticket.create({
    data: {
      name: 'Workshop Add-on',
      price: 49.99,
      quantity: 50,
      sold: 0,
      status: 'CANCELLED',
      eventId: cancelledEvent.id,
      tenantId,
    },
  });

  await prisma.registration.create({
    data: {
      status: 'CONFIRMED',
      eventId: event.id,
      userId: attendee.id,
      tenantId,
    },
  });

  // Cancelled registration for failure state
  await prisma.registration.create({
    data: {
      status: 'CANCELLED',
      eventId: cancelledEvent.id,
      userId: organizer.id,
      tenantId,
    },
  });

  // Pending registration
  await prisma.registration.create({
    data: {
      status: 'PENDING',
      eventId: event.id,
      userId: admin.id,
      tenantId,
    },
  });
}

main()
  .catch((e: unknown) => {
    if (e instanceof Error) {
      console.error(e.message);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
