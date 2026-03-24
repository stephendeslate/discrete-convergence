// TRACED:EM-SEED-001 — Seed with error handling and shared imports
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('password123', BCRYPT_SALT_ROUNDS);

  const org = await prisma.organization.create({
    data: {
      name: 'Demo Events Inc',
      slug: 'demo-events',
      tier: 'PRO',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo-events.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@demo-events.com',
      name: 'Event Organizer',
      passwordHash,
      role: 'ORGANIZER',
      organizationId: org.id,
    },
  });

  const attendee = await prisma.user.create({
    data: {
      email: 'attendee@demo-events.com',
      name: 'Jane Attendee',
      passwordHash,
      role: 'ATTENDEE',
      organizationId: org.id,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Grand Convention Center',
      address: '123 Main St',
      city: 'San Francisco',
      capacity: 500,
      organizationId: org.id,
    },
  });

  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Tech Conference 2024',
      slug: 'tech-conference-2024',
      description: 'Annual technology conference',
      status: 'PUBLISHED',
      startDate: new Date('2024-06-15T09:00:00Z'),
      endDate: new Date('2024-06-15T18:00:00Z'),
      timezone: 'America/Los_Angeles',
      capacity: 200,
      organizationId: org.id,
      venueId: venue.id,
    },
  });

  const draftEvent = await prisma.event.create({
    data: {
      title: 'Workshop Series',
      slug: 'workshop-series',
      description: 'Monthly workshop series',
      status: 'DRAFT',
      startDate: new Date('2024-08-01T10:00:00Z'),
      endDate: new Date('2024-08-01T16:00:00Z'),
      organizationId: org.id,
    },
  });

  // TRACED:EM-SEED-002 — Seed includes error/failure state data
  const cancelledEvent = await prisma.event.create({
    data: {
      title: 'Cancelled Meetup',
      slug: 'cancelled-meetup',
      status: 'CANCELLED',
      startDate: new Date('2024-05-01T18:00:00Z'),
      endDate: new Date('2024-05-01T21:00:00Z'),
      organizationId: org.id,
    },
  });

  const generalTicket = await prisma.ticketType.create({
    data: {
      name: 'General Admission',
      priceInCents: 5000,
      quota: 150,
      soldCount: 3,
      eventId: publishedEvent.id,
    },
  });

  const vipTicket = await prisma.ticketType.create({
    data: {
      name: 'VIP',
      description: 'Includes backstage access',
      priceInCents: 15000,
      quota: 50,
      soldCount: 1,
      eventId: publishedEvent.id,
    },
  });

  await prisma.eventSession.create({
    data: {
      title: 'Opening Keynote',
      startTime: new Date('2024-06-15T09:00:00Z'),
      endTime: new Date('2024-06-15T10:00:00Z'),
      track: 'Main Stage',
      speaker: 'Dr. Tech Leader',
      eventId: publishedEvent.id,
    },
  });

  const confirmedReg = await prisma.registration.create({
    data: {
      status: 'CONFIRMED',
      qrCode: 'QR-DEMO-001',
      userId: attendee.id,
      eventId: publishedEvent.id,
      ticketTypeId: generalTicket.id,
    },
  });

  const cancelledReg = await prisma.registration.create({
    data: {
      status: 'CANCELLED',
      userId: organizer.id,
      eventId: publishedEvent.id,
      ticketTypeId: vipTicket.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'CONFIRMATION',
      status: 'SENT',
      recipient: attendee.email,
      subject: 'Registration Confirmed',
      body: 'Your registration for Tech Conference 2024 has been confirmed.',
      eventId: publishedEvent.id,
      sentAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      type: 'CANCELLATION',
      status: 'FAILED',
      recipient: 'invalid@email',
      subject: 'Event Cancelled',
      body: 'The Cancelled Meetup has been cancelled.',
      eventId: cancelledEvent.id,
      errorMessage: 'SMTP connection refused',
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'event.published',
      entityType: 'Event',
      entityId: publishedEvent.id,
      changes: { status: { from: 'DRAFT', to: 'PUBLISHED' } },
      userId: organizer.id,
      organizationId: org.id,
    },
  });
}

main()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      process.stderr.write(`Seed failed: ${error.message}\n`);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
