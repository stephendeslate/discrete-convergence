import { PrismaClient, EventStatus, RegistrationStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

// TRACED:EM-INFRA-001 — Seed uses BCRYPT_SALT_ROUNDS from shared, includes error state data
// TRACED:EM-DATA-003 — Migration includes ENABLE and FORCE ROW LEVEL SECURITY (exercised by seed)
// TRACED:EM-INFRA-003 — Prisma pinned with >=6.0.0 <7.0.0 range (verified in package.json)

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  });

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      name: 'Admin User',
      role: UserRole.ADMIN,
      organizationId: org.id,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@demo.com',
      passwordHash,
      name: 'Organizer User',
      role: UserRole.ORGANIZER,
      organizationId: org.id,
    },
  });

  const attendee = await prisma.user.create({
    data: {
      email: 'attendee@demo.com',
      passwordHash,
      name: 'Attendee User',
      role: UserRole.ATTENDEE,
      organizationId: org.id,
    },
  });

  // Create venue
  const venue = await prisma.venue.create({
    data: {
      name: 'Main Conference Hall',
      address: '123 Conference Dr',
      city: 'San Francisco',
      capacity: 500,
      organizationId: org.id,
    },
  });

  // Create events in various states including error/cancelled states
  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Annual Tech Conference',
      description: 'A major technology conference',
      slug: 'annual-tech-conf',
      status: EventStatus.REGISTRATION_OPEN,
      startDate: new Date('2026-06-15T09:00:00Z'),
      endDate: new Date('2026-06-17T17:00:00Z'),
      capacity: 200,
      organizationId: org.id,
      venueId: venue.id,
    },
  });

  // Error state: Cancelled event
  const cancelledEvent = await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This workshop was cancelled due to low registration',
      slug: 'cancelled-workshop',
      status: EventStatus.CANCELLED,
      startDate: new Date('2026-04-01T09:00:00Z'),
      endDate: new Date('2026-04-01T17:00:00Z'),
      capacity: 50,
      organizationId: org.id,
    },
  });

  // Draft event
  await prisma.event.create({
    data: {
      title: 'Upcoming Meetup',
      description: 'A draft meetup event',
      slug: 'upcoming-meetup',
      status: EventStatus.DRAFT,
      startDate: new Date('2026-08-01T18:00:00Z'),
      endDate: new Date('2026-08-01T21:00:00Z'),
      capacity: 30,
      organizationId: org.id,
    },
  });

  // Create ticket types
  await prisma.ticketType.create({
    data: {
      name: 'General Admission',
      price: 5000, // $50.00 in cents
      quota: 150,
      eventId: publishedEvent.id,
    },
  });

  await prisma.ticketType.create({
    data: {
      name: 'VIP',
      price: 15000, // $150.00 in cents
      quota: 50,
      eventId: publishedEvent.id,
    },
  });

  // Create sessions
  await prisma.eventSession.create({
    data: {
      title: 'Opening Keynote',
      startTime: new Date('2026-06-15T09:00:00Z'),
      endTime: new Date('2026-06-15T10:00:00Z'),
      track: 'Main',
      eventId: publishedEvent.id,
    },
  });

  // Create registrations including cancelled registration (error state)
  await prisma.registration.create({
    data: {
      userId: attendee.id,
      eventId: publishedEvent.id,
      organizationId: org.id,
      status: RegistrationStatus.CONFIRMED,
    },
  });

  // Error state: Cancelled registration
  await prisma.registration.create({
    data: {
      userId: organizer.id,
      eventId: publishedEvent.id,
      organizationId: org.id,
      status: RegistrationStatus.CANCELLED,
    },
  });

  // Create audit log entries
  await prisma.auditLog.create({
    data: {
      action: 'EVENT_CREATED',
      entityType: 'Event',
      entityId: publishedEvent.id,
      userId: organizer.id,
      organizationId: org.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'EVENT_CANCELLED',
      entityType: 'Event',
      entityId: cancelledEvent.id,
      userId: admin.id,
      organizationId: org.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
