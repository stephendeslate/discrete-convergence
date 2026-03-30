import { PrismaClient, UserRole, EventStatus, TicketStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

// TRACED: EM-INFRA-004
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
      role: UserRole.ADMIN,
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
      role: UserRole.ORGANIZER,
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
      role: UserRole.USER,
      tenantId,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Main Conference Hall',
      address: '123 Tech Street',
      city: 'San Francisco',
      capacity: 500,
      tenantId,
    },
  });

  const event = await prisma.event.create({
    data: {
      title: 'Tech Conference 2026',
      description: 'Annual technology conference',
      startDate: new Date('2026-06-15T09:00:00Z'),
      endDate: new Date('2026-06-17T17:00:00Z'),
      status: EventStatus.PUBLISHED,
      capacity: 200,
      venueId: venue.id,
      tenantId,
    },
  });

  // Error/failure state data
  const cancelledEvent = await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This workshop was cancelled due to low enrollment',
      startDate: new Date('2026-03-01T09:00:00Z'),
      endDate: new Date('2026-03-01T17:00:00Z'),
      status: EventStatus.CANCELLED,
      capacity: 30,
      venueId: venue.id,
      tenantId,
    },
  });

  await prisma.schedule.create({
    data: {
      title: 'Opening Keynote',
      speaker: 'Jane Smith',
      startTime: new Date('2026-06-15T09:00:00Z'),
      endTime: new Date('2026-06-15T10:00:00Z'),
      room: 'Main Hall',
      eventId: event.id,
      tenantId,
    },
  });

  await prisma.ticket.create({
    data: {
      price: 299.99,
      type: 'VIP',
      status: TicketStatus.AVAILABLE,
      eventId: event.id,
      tenantId,
    },
  });

  // Error state: cancelled ticket
  await prisma.ticket.create({
    data: {
      price: 99.99,
      type: 'Early Bird',
      status: TicketStatus.CANCELLED,
      eventId: cancelledEvent.id,
      tenantId,
    },
  });

  await prisma.attendee.create({
    data: {
      userId: user.id,
      eventId: event.id,
      tenantId,
    },
  });

  // Keep linter happy with variable usage
  void admin;
  void organizer;
}

main()
  .catch((error: Error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
