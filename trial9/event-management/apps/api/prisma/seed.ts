import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

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

  const venue = await prisma.venue.create({
    data: {
      name: 'Grand Convention Center',
      address: '123 Main St, City',
      capacity: 500,
      tenantId,
    },
  });

  const smallVenue = await prisma.venue.create({
    data: {
      name: 'Small Meeting Room',
      address: '456 Side St, City',
      capacity: 10,
      tenantId,
    },
  });

  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Tech Conference 2025',
      description: 'Annual technology conference',
      startDate: new Date('2025-06-15T09:00:00Z'),
      endDate: new Date('2025-06-17T17:00:00Z'),
      status: 'PUBLISHED',
      tenantId,
      venueId: venue.id,
    },
  });

  // Error/failure state: cancelled event
  await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled',
      startDate: new Date('2025-03-01T09:00:00Z'),
      endDate: new Date('2025-03-01T17:00:00Z'),
      status: 'CANCELLED',
      tenantId,
      venueId: smallVenue.id,
    },
  });

  // Draft event (not published yet)
  await prisma.event.create({
    data: {
      title: 'Draft Summit',
      description: 'Still in planning',
      startDate: new Date('2025-09-01T09:00:00Z'),
      endDate: new Date('2025-09-02T17:00:00Z'),
      status: 'DRAFT',
      tenantId,
      venueId: venue.id,
    },
  });

  await prisma.ticket.create({
    data: {
      eventId: publishedEvent.id,
      type: 'General Admission',
      price: 99.99,
      status: 'AVAILABLE',
      tenantId,
    },
  });

  await prisma.ticket.create({
    data: {
      eventId: publishedEvent.id,
      type: 'VIP',
      price: 249.99,
      status: 'SOLD',
      tenantId,
    },
  });

  await prisma.attendee.create({
    data: {
      eventId: publishedEvent.id,
      userId: user.id,
      tenantId,
    },
  });

  await prisma.schedule.create({
    data: {
      eventId: publishedEvent.id,
      title: 'Opening Keynote',
      startTime: new Date('2025-06-15T09:00:00Z'),
      endTime: new Date('2025-06-15T10:00:00Z'),
      location: 'Main Hall',
      tenantId,
    },
  });

  await prisma.schedule.create({
    data: {
      eventId: publishedEvent.id,
      title: 'Workshop A',
      startTime: new Date('2025-06-15T10:30:00Z'),
      endTime: new Date('2025-06-15T12:00:00Z'),
      location: 'Room 101',
      tenantId,
    },
  });

  // Using unused variables to avoid lint warnings
  void admin;
  void organizer;
}

main()
  .then(() => {
    return prisma.$disconnect();
  })
  .catch((e: Error) => {
    console.error('Seed failed:', e);
    return prisma.$disconnect().then(() => {
      process.exit(1);
    });
  });
