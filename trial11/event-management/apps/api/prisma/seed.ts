import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

// TRACED: EM-INFRA-001
const prisma = new PrismaClient();

async function main() {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const passwordHash = await bcrypt.hash('Password123!', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId,
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      passwordHash,
      name: 'Event Organizer',
      role: 'ORGANIZER',
      tenantId,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash,
      name: 'Regular User',
      role: 'USER',
      tenantId,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Grand Convention Center',
      address: '123 Main St, Anytown, ST 12345',
      capacity: 500,
      tenantId,
    },
  });

  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Annual Tech Conference',
      description: 'A major technology conference featuring the latest innovations.',
      status: 'PUBLISHED',
      startDate: new Date('2025-06-15T09:00:00Z'),
      endDate: new Date('2025-06-17T18:00:00Z'),
      venueId: venue.id,
      tenantId,
    },
  });

  // Error/failure state data
  const cancelledEvent = await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This workshop was cancelled due to unforeseen circumstances.',
      status: 'CANCELLED',
      startDate: new Date('2025-05-01T09:00:00Z'),
      endDate: new Date('2025-05-01T17:00:00Z'),
      venueId: venue.id,
      tenantId,
    },
  });

  const draftEvent = await prisma.event.create({
    data: {
      title: 'Upcoming Hackathon',
      description: 'A draft event not yet published.',
      status: 'DRAFT',
      startDate: new Date('2025-09-01T09:00:00Z'),
      endDate: new Date('2025-09-02T18:00:00Z'),
      venueId: venue.id,
      tenantId,
    },
  });

  await prisma.ticket.createMany({
    data: [
      {
        name: 'General Admission',
        price: 99.99,
        quantity: 200,
        status: 'AVAILABLE',
        eventId: publishedEvent.id,
        tenantId,
      },
      {
        name: 'VIP Pass',
        price: 299.99,
        quantity: 50,
        status: 'AVAILABLE',
        eventId: publishedEvent.id,
        tenantId,
      },
      {
        name: 'Cancelled Ticket',
        price: 49.99,
        quantity: 0,
        status: 'CANCELLED',
        eventId: cancelledEvent.id,
        tenantId,
      },
    ],
  });

  await prisma.schedule.createMany({
    data: [
      {
        title: 'Opening Keynote',
        startTime: new Date('2025-06-15T09:00:00Z'),
        endTime: new Date('2025-06-15T10:00:00Z'),
        location: 'Main Hall',
        eventId: publishedEvent.id,
        tenantId,
      },
      {
        title: 'Networking Lunch',
        startTime: new Date('2025-06-15T12:00:00Z'),
        endTime: new Date('2025-06-15T13:00:00Z'),
        location: 'Dining Hall',
        eventId: publishedEvent.id,
        tenantId,
      },
    ],
  });

  await prisma.attendee.create({
    data: {
      userId: regularUser.id,
      eventId: publishedEvent.id,
      tenantId,
    },
  });

  process.stdout.write(
    `Seed complete: ${admin.email}, ${organizer.email}, ${regularUser.email}, venue: ${venue.name}, events: ${publishedEvent.title}, ${cancelledEvent.title}, ${draftEvent.title}\n`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    process.stderr.write(`Seed error: ${error instanceof Error ? error.message : String(error)}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
