import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '00000000-0000-0000-0000-000000000001';

  const adminPasswordHash = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
  const viewerPasswordHash = await bcrypt.hash('viewer123', BCRYPT_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      tenantId,
    },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      passwordHash: viewerPasswordHash,
      role: 'VIEWER',
      tenantId,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Main Conference Hall',
      address: '123 Conference St',
      city: 'Tech City',
      capacity: 500,
      tenantId,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Annual Tech Conference',
      description: 'A premier technology conference',
      startDate: new Date('2025-06-15T09:00:00Z'),
      endDate: new Date('2025-06-15T17:00:00Z'),
      status: 'PUBLISHED',
      maxAttendees: 200,
      ticketPrice: 49.99,
      tenantId,
      venueId: venue.id,
    },
  });

  // Error/failure state data
  await prisma.event.create({
    data: {
      title: 'Cancelled Workshop',
      description: 'This event was cancelled',
      startDate: new Date('2024-01-01T09:00:00Z'),
      endDate: new Date('2024-01-01T12:00:00Z'),
      status: 'CANCELLED',
      maxAttendees: 50,
      ticketPrice: 0,
      tenantId,
      venueId: venue.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
