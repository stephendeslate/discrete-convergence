// TRACED:EM-INFRA-002 — seed with error handling, BCRYPT_SALT_ROUNDS from shared, error state data
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const org = await prisma.organization.create({
    data: {
      name: 'Demo Events Inc.',
      slug: 'demo-events',
      tier: 'PRO',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo-events.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@demo-events.com',
      passwordHash,
      firstName: 'Event',
      lastName: 'Organizer',
      role: 'ORGANIZER',
      organizationId: org.id,
    },
  });

  const attendee = await prisma.user.create({
    data: {
      email: 'attendee@demo-events.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'Attendee',
      role: 'ATTENDEE',
      organizationId: org.id,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Grand Convention Center',
      address: '100 Main St, Anytown, USA',
      capacity: 500,
      isVirtual: false,
      organizationId: org.id,
    },
  });

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthEnd = new Date(nextMonth);
  nextMonthEnd.setHours(nextMonthEnd.getHours() + 8);

  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Annual Tech Conference 2026',
      slug: 'annual-tech-conference-2026',
      description: 'A premier technology conference with workshops and networking.',
      status: 'PUBLISHED',
      timezone: 'America/New_York',
      startDate: nextMonth,
      endDate: nextMonthEnd,
      organizationId: org.id,
      venueId: venue.id,
    },
  });

  await prisma.ticketType.create({
    data: {
      name: 'General Admission',
      price: 49.99,
      quota: 200,
      sold: 0,
      eventId: publishedEvent.id,
    },
  });

  await prisma.ticketType.create({
    data: {
      name: 'VIP',
      price: 149.99,
      quota: 50,
      sold: 0,
      eventId: publishedEvent.id,
    },
  });

  // Error/failure state: cancelled event
  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - 2);
  const pastDateEnd = new Date(pastDate);
  pastDateEnd.setHours(pastDateEnd.getHours() + 4);

  await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      slug: 'cancelled-workshop',
      description: 'This event was cancelled due to low registrations.',
      status: 'CANCELLED',
      timezone: 'UTC',
      startDate: pastDate,
      endDate: pastDateEnd,
      organizationId: org.id,
    },
  });

  // Error/failure state: completed event
  const completedDate = new Date();
  completedDate.setMonth(completedDate.getMonth() - 1);
  const completedDateEnd = new Date(completedDate);
  completedDateEnd.setHours(completedDateEnd.getHours() + 6);

  await prisma.event.create({
    data: {
      title: 'Past Networking Mixer',
      slug: 'past-networking-mixer',
      description: 'A completed networking event.',
      status: 'COMPLETED',
      timezone: 'America/Chicago',
      startDate: completedDate,
      endDate: completedDateEnd,
      organizationId: org.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'SEED',
      entityType: 'SYSTEM',
      entityId: org.id,
      details: { message: 'Database seeded successfully' },
      organizationId: org.id,
      userId: admin.id,
    },
  });

  // Use variables to avoid unused lint warnings
  void organizer;
  void attendee;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    process.stderr.write(`Seed error: ${err.message}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
