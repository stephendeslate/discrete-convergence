import { PrismaClient, UserRole, EventStatus, RegistrationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: 'Demo Organization' },
  });

  const adminHash = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
  const viewerHash = await bcrypt.hash('viewer123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: adminHash,
      name: 'Admin User',
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@demo.com',
      passwordHash: viewerHash,
      name: 'Viewer User',
      role: UserRole.VIEWER,
      tenantId: tenant.id,
    },
  });

  const venue1 = await prisma.venue.create({
    data: {
      name: 'Main Conference Hall',
      address: '123 Main St, Downtown',
      capacity: 500,
      tenantId: tenant.id,
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Small Meeting Room',
      address: '456 Side St, Downtown',
      capacity: 20,
      tenantId: tenant.id,
    },
  });

  const publishedEvent = await prisma.event.create({
    data: {
      title: 'Annual Tech Conference',
      description: 'The biggest tech event of the year',
      date: new Date('2025-06-15T09:00:00Z'),
      endDate: new Date('2025-06-15T17:00:00Z'),
      status: EventStatus.PUBLISHED,
      price: 99.99,
      capacity: 200,
      venueId: venue1.id,
      tenantId: tenant.id,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled',
      date: new Date('2025-07-01T10:00:00Z'),
      status: EventStatus.CANCELLED,
      price: 0,
      capacity: 50,
      venueId: venue2.id,
      tenantId: tenant.id,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Draft Meetup',
      description: 'Still planning this event',
      date: new Date('2025-08-20T18:00:00Z'),
      status: EventStatus.DRAFT,
      price: 0,
      capacity: 30,
      tenantId: tenant.id,
    },
  });

  const attendee1 = await prisma.attendee.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1-555-0101',
      tenantId: tenant.id,
    },
  });

  const attendee2 = await prisma.attendee.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      tenantId: tenant.id,
    },
  });

  await prisma.registration.create({
    data: {
      eventId: publishedEvent.id,
      attendeeId: attendee1.id,
      status: RegistrationStatus.CONFIRMED,
      tenantId: tenant.id,
    },
  });

  await prisma.registration.create({
    data: {
      eventId: publishedEvent.id,
      attendeeId: attendee2.id,
      status: RegistrationStatus.PENDING,
      tenantId: tenant.id,
    },
  });

  await prisma.registration.create({
    data: {
      eventId: publishedEvent.id,
      attendeeId: attendee1.id,
      status: RegistrationStatus.CANCELLED,
      tenantId: tenant.id,
    },
  });

  void admin;
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${e}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
