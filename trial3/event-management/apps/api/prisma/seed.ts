// TRACED:EM-INFRA-001
// TRACED:EM-DATA-002 — seed exercises the migration that enables RLS on all tables
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const org = await prisma.organization.create({
    data: {
      name: 'Demo Events Co',
      slug: 'demo-events-co',
      tier: 'PRO',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@demo.com',
      passwordHash,
      name: 'Organizer User',
      role: 'ORGANIZER',
      organizationId: org.id,
    },
  });

  const attendee = await prisma.user.create({
    data: {
      email: 'attendee@demo.com',
      passwordHash,
      name: 'Attendee User',
      role: 'ATTENDEE',
      organizationId: org.id,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Convention Center',
      address: '123 Main St',
      city: 'Demo City',
      capacity: 500,
      organizationId: org.id,
    },
  });

  const virtualVenue = await prisma.venue.create({
    data: {
      name: 'Virtual Stage',
      isVirtual: true,
      virtualUrl: 'https://meet.example.com/stage',
      capacity: 1000,
      organizationId: org.id,
    },
  });

  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Tech Conference 2026',
      description: 'Annual technology conference with workshops and talks',
      slug: 'tech-conf-2026',
      status: 'REGISTRATION_OPEN',
      timezone: 'America/New_York',
      startDate: new Date('2026-06-15T09:00:00Z'),
      endDate: new Date('2026-06-17T17:00:00Z'),
      capacity: 300,
      organizationId: org.id,
      venueId: venue.id,
    },
  });

  const draftEvent = await prisma.event.create({
    data: {
      title: 'Startup Meetup',
      description: 'Monthly startup networking event',
      slug: 'startup-meetup-april',
      status: 'DRAFT',
      timezone: 'America/Chicago',
      startDate: new Date('2026-04-20T18:00:00Z'),
      endDate: new Date('2026-04-20T21:00:00Z'),
      capacity: 50,
      organizationId: org.id,
      venueId: virtualVenue.id,
    },
  });

  // Cancelled event - error/failure state data
  const cancelledEvent = await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled due to low attendance',
      slug: 'cancelled-workshop',
      status: 'CANCELLED',
      timezone: 'UTC',
      startDate: new Date('2026-03-01T10:00:00Z'),
      endDate: new Date('2026-03-01T16:00:00Z'),
      capacity: 20,
      organizationId: org.id,
    },
  });

  const generalTicket = await prisma.ticketType.create({
    data: {
      name: 'General Admission',
      description: 'Standard entry ticket',
      price: 49.99,
      quota: 200,
      soldCount: 1,
      eventId: publishedEvent.id,
    },
  });

  const vipTicket = await prisma.ticketType.create({
    data: {
      name: 'VIP Pass',
      description: 'VIP access with backstage pass',
      price: 149.99,
      quota: 50,
      eventId: publishedEvent.id,
    },
  });

  await prisma.eventSession.createMany({
    data: [
      {
        title: 'Opening Keynote',
        description: 'Welcome and keynote presentation',
        startTime: new Date('2026-06-15T09:00:00Z'),
        endTime: new Date('2026-06-15T10:30:00Z'),
        track: 'Main Stage',
        eventId: publishedEvent.id,
      },
      {
        title: 'AI Workshop',
        description: 'Hands-on AI development workshop',
        startTime: new Date('2026-06-15T11:00:00Z'),
        endTime: new Date('2026-06-15T12:30:00Z'),
        track: 'Workshop Room A',
        eventId: publishedEvent.id,
      },
    ],
  });

  const registration = await prisma.registration.create({
    data: {
      userId: attendee.id,
      eventId: publishedEvent.id,
      ticketTypeId: generalTicket.id,
      organizationId: org.id,
      status: 'CONFIRMED',
    },
  });

  // Cancelled registration - error/failure state data
  await prisma.registration.create({
    data: {
      userId: organizer.id,
      eventId: publishedEvent.id,
      ticketTypeId: vipTicket.id,
      organizationId: org.id,
      status: 'CANCELLED',
    },
  });

  await prisma.waitlistEntry.create({
    data: {
      email: 'waitlisted@example.com',
      name: 'Waitlisted Person',
      eventId: publishedEvent.id,
    },
  });

  await prisma.notification.create({
    data: {
      subject: 'Registration Confirmation',
      body: 'Your registration for Tech Conference 2026 has been confirmed.',
      recipientEmail: attendee.email,
      status: 'SENT',
      sentAt: new Date(),
      organizationId: org.id,
    },
  });

  // Failed notification - error/failure state data
  await prisma.notification.create({
    data: {
      subject: 'Reminder: Event Tomorrow',
      body: 'Your event starts tomorrow.',
      recipientEmail: 'invalid-email@nonexistent.test',
      status: 'FAILED',
      organizationId: org.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'EVENT_CREATED',
      entityType: 'Event',
      entityId: publishedEvent.id,
      userId: organizer.id,
      organizationId: org.id,
    },
  });

  // Use void to reference all created values for seeding verification
  void [admin, draftEvent, cancelledEvent, vipTicket, registration];
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: Error) => {
    // eslint-disable-next-line no-console
    process.stderr.write(`Seed error: ${e.message}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
