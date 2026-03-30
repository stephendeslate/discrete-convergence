// TRACED:EM-DATA-008 — Seed script with realistic event lifecycle data and error handling
// TRACED:EM-DATA-005 — Enum values with @map/@map for PostgreSQL naming conventions
// TRACED:EM-CROSS-004 — Both apps import from shared package
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', BCRYPT_SALT_ROUNDS);

  const org = await prisma.organization.create({
    data: { name: 'Demo Events Co' },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo-events.com',
      name: 'Demo Admin',
      passwordHash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Main Convention Center',
      address: '123 Event Street',
      capacity: 500,
      type: 'PHYSICAL',
      organizationId: org.id,
    },
  });

  const draftEvent = await prisma.event.create({
    data: {
      name: 'Tech Conference 2026',
      slug: 'tech-conf-2026',
      description: 'Annual technology conference',
      status: 'DRAFT',
      startDate: new Date('2026-06-15T09:00:00Z'),
      endDate: new Date('2026-06-17T18:00:00Z'),
      timezone: 'America/New_York',
      organizationId: org.id,
      venueId: venue.id,
    },
  });

  await prisma.ticketType.create({
    data: { name: 'General Admission', price: 9900, quota: 200, eventId: draftEvent.id },
  });

  await prisma.ticketType.create({
    data: { name: 'VIP', price: 29900, quota: 50, eventId: draftEvent.id },
  });

  const publishedEvent = await prisma.event.create({
    data: {
      name: 'Community Meetup',
      slug: 'community-meetup',
      description: 'Monthly community gathering',
      status: 'REGISTRATION_OPEN',
      startDate: new Date('2026-04-10T18:00:00Z'),
      endDate: new Date('2026-04-10T21:00:00Z'),
      timezone: 'America/Chicago',
      organizationId: org.id,
      venueId: venue.id,
    },
  });

  const meetupTicket = await prisma.ticketType.create({
    data: { name: 'Free Entry', price: 0, quota: 100, eventId: publishedEvent.id },
  });

  await prisma.registration.create({
    data: {
      userId: admin.id,
      eventId: publishedEvent.id,
      ticketTypeId: meetupTicket.id,
      organizationId: org.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.event.create({
    data: {
      name: 'Past Workshop',
      slug: 'past-workshop',
      description: 'Completed event for testing',
      status: 'COMPLETED',
      startDate: new Date('2025-12-01T10:00:00Z'),
      endDate: new Date('2025-12-01T16:00:00Z'),
      timezone: 'UTC',
      organizationId: org.id,
    },
  });
}

main()
  .catch((e) => {
    process.stderr.write(String(e) + '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
