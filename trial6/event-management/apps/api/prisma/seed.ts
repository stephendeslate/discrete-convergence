// TRACED:EM-INFRA-002 — Seed with error handling, BCRYPT_SALT_ROUNDS from shared, error/failure state data
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Events',
      subscriptionTier: 'PRO',
      brandColor: '#3B82F6',
    },
  });

  const failedTenant = await prisma.tenant.create({
    data: {
      name: 'Expired Corp',
      subscriptionTier: 'FREE',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme-events.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@acme-events.com',
      passwordHash,
      name: 'Event Organizer',
      role: 'ORGANIZER',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@acme-events.com',
      passwordHash,
      name: 'Event Viewer',
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Grand Convention Center',
      address: '123 Main St, Metropolis, ST 00001',
      capacity: 5000,
      tenantId: tenant.id,
    },
  });

  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Annual Tech Conference 2026',
      description: 'The premier technology conference of the year.',
      status: 'PUBLISHED',
      startDate: new Date('2026-06-15T09:00:00Z'),
      endDate: new Date('2026-06-17T18:00:00Z'),
      tenantId: tenant.id,
      venueId: venue.id,
    },
  });

  // Error/failure state data — cancelled event
  await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled due to low registrations.',
      status: 'CANCELLED',
      startDate: new Date('2026-04-01T09:00:00Z'),
      endDate: new Date('2026-04-01T17:00:00Z'),
      tenantId: tenant.id,
    },
  });

  // Error/failure state data — draft event (incomplete)
  await prisma.event.create({
    data: {
      title: 'Draft Meetup',
      description: null,
      status: 'DRAFT',
      startDate: new Date('2026-08-01T09:00:00Z'),
      endDate: new Date('2026-08-01T12:00:00Z'),
      tenantId: failedTenant.id,
    },
  });

  const generalTicket = await prisma.ticket.create({
    data: {
      type: 'GENERAL',
      price: 99.99,
      quantity: 1000,
      sold: 150,
      eventId: publishedEvent.id,
    },
  });

  const vipTicket = await prisma.ticket.create({
    data: {
      type: 'VIP',
      price: 299.99,
      quantity: 100,
      sold: 25,
      eventId: publishedEvent.id,
    },
  });

  await prisma.attendee.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      checkInStatus: 'CHECKED_IN',
      eventId: publishedEvent.id,
      ticketId: generalTicket.id,
    },
  });

  await prisma.attendee.create({
    data: {
      name: 'Bob Williams',
      email: 'bob@example.com',
      checkInStatus: 'REGISTERED',
      eventId: publishedEvent.id,
      ticketId: vipTicket.id,
    },
  });

  // Error/failure state — no-show attendee
  await prisma.attendee.create({
    data: {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      checkInStatus: 'NO_SHOW',
      eventId: publishedEvent.id,
      ticketId: generalTicket.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'Event',
      entityId: publishedEvent.id,
      details: 'Created Annual Tech Conference 2026',
      userId: organizer.id,
      tenantId: tenant.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'LOGIN',
      entity: 'User',
      entityId: adminUser.id,
      details: 'Admin login',
      userId: adminUser.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Seed failed: ${message}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
