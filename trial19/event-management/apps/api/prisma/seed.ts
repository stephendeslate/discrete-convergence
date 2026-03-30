import { PrismaClient, UserRole, EventStatus, RegistrationStatus } from '@prisma/client';
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
      role: UserRole.ADMIN,
      tenantId,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      passwordHash,
      role: UserRole.VIEWER,
      tenantId,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Main Conference Hall',
      address: '123 Main Street, City, ST 12345',
      capacity: 500,
      tenantId,
    },
  });

  const futureEvent = await prisma.event.create({
    data: {
      title: 'Annual Tech Conference',
      description: 'A conference about emerging technologies',
      startDate: new Date('2025-06-15T09:00:00Z'),
      endDate: new Date('2025-06-15T17:00:00Z'),
      status: EventStatus.PUBLISHED,
      venueId: venue.id,
      tenantId,
    },
  });

  const draftEvent = await prisma.event.create({
    data: {
      title: 'Draft Workshop',
      description: 'A workshop in draft status',
      startDate: new Date('2025-07-01T10:00:00Z'),
      endDate: new Date('2025-07-01T14:00:00Z'),
      status: EventStatus.DRAFT,
      tenantId,
    },
  });

  // Error/failure state data: cancelled event
  const cancelledEvent = await prisma.event.create({
    data: {
      title: 'Cancelled Meetup',
      description: 'This event was cancelled due to low registration',
      startDate: new Date('2025-05-01T18:00:00Z'),
      endDate: new Date('2025-05-01T20:00:00Z'),
      status: EventStatus.CANCELLED,
      tenantId,
    },
  });

  const attendee = await prisma.attendee.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      tenantId,
    },
  });

  await prisma.registration.create({
    data: {
      eventId: futureEvent.id,
      attendeeId: attendee.id,
      status: RegistrationStatus.CONFIRMED,
      tenantId,
    },
  });

  // Error/failure state data: cancelled registration
  await prisma.registration.create({
    data: {
      eventId: cancelledEvent.id,
      attendeeId: attendee.id,
      status: RegistrationStatus.CANCELLED,
      tenantId,
    },
  });

  process.stdout.write(
    `Seeded: ${admin.email}, ${viewer.email}, ${venue.name}, ` +
    `${futureEvent.title}, ${draftEvent.title}, ${cancelledEvent.title}, ` +
    `${attendee.name}\n`,
  );
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${String(e)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
