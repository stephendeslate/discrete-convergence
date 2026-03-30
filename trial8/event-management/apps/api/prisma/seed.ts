import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '00000000-0000-0000-0000-000000000001';

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Seed admin user
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

  // Seed organizer
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

  // Seed regular user
  const user = await prisma.user.upsert({
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

  // Seed venue
  const venue = await prisma.venue.create({
    data: {
      name: 'Grand Convention Center',
      address: '123 Main St',
      city: 'New York',
      country: 'US',
      capacity: 500,
      tenantId,
    },
  });

  // Seed published event
  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Tech Conference 2025',
      description: 'Annual technology conference',
      startDate: new Date('2025-06-01T09:00:00Z'),
      endDate: new Date('2025-06-03T17:00:00Z'),
      status: 'PUBLISHED',
      venueId: venue.id,
      tenantId,
    },
  });

  // Seed cancelled event (error/failure state data)
  const cancelledEvent = await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled due to low registration',
      startDate: new Date('2025-03-15T09:00:00Z'),
      endDate: new Date('2025-03-15T17:00:00Z'),
      status: 'CANCELLED',
      tenantId,
    },
  });

  // Seed completed past event (failure/edge case)
  const pastEvent = await prisma.event.create({
    data: {
      title: 'Past Meetup 2024',
      description: 'A meetup that has already occurred',
      startDate: new Date('2024-01-10T18:00:00Z'),
      endDate: new Date('2024-01-10T21:00:00Z'),
      status: 'COMPLETED',
      tenantId,
    },
  });

  // Seed tickets — including sold out scenario
  await prisma.ticket.create({
    data: {
      eventId: publishedEvent.id,
      type: 'GENERAL',
      price: 99.99,
      status: 'AVAILABLE',
      tenantId,
    },
  });

  await prisma.ticket.create({
    data: {
      eventId: publishedEvent.id,
      type: 'VIP',
      price: 299.99,
      status: 'SOLD',
      tenantId,
    },
  });

  // Cancelled ticket (failure state)
  await prisma.ticket.create({
    data: {
      eventId: cancelledEvent.id,
      type: 'GENERAL',
      price: 50.0,
      status: 'CANCELLED',
      tenantId,
    },
  });

  // Seed attendee
  await prisma.attendee.create({
    data: {
      eventId: publishedEvent.id,
      userId: user.id,
      tenantId,
    },
  });

  // Seed schedule
  await prisma.schedule.create({
    data: {
      eventId: publishedEvent.id,
      title: 'Opening Keynote',
      startTime: new Date('2025-06-01T09:00:00Z'),
      endTime: new Date('2025-06-01T10:00:00Z'),
      room: 'Main Hall',
      speaker: 'Dr. Jane Smith',
      tenantId,
    },
  });

  // Log seeded IDs for reference (using structured format for Pino compat)
  process.stdout.write(
    JSON.stringify({
      message: 'Seed completed',
      admin: admin.id,
      organizer: organizer.id,
      user: user.id,
      venue: venue.id,
      publishedEvent: publishedEvent.id,
      cancelledEvent: cancelledEvent.id,
      pastEvent: pastEvent.id,
    }) + '\n',
  );
}

main()
  .catch((e) => {
    process.stderr.write(String(e) + '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
