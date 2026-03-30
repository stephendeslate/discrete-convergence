// TRACED: FD-INFRA-002
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@fleet.test' },
    update: {},
    create: {
      email: 'admin@fleet.test',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId,
    },
  });

  // Create dispatcher user
  await prisma.user.upsert({
    where: { email: 'dispatcher@fleet.test' },
    update: {},
    create: {
      email: 'dispatcher@fleet.test',
      password: passwordHash,
      name: 'Test Dispatcher',
      role: 'DISPATCHER',
      tenantId,
    },
  });

  // Create driver user
  await prisma.user.upsert({
    where: { email: 'driver@fleet.test' },
    update: {},
    create: {
      email: 'driver@fleet.test',
      password: passwordHash,
      name: 'Test Driver',
      role: 'DRIVER',
      tenantId,
    },
  });

  // Create vehicles including one with error state
  await prisma.vehicle.createMany({
    data: [
      {
        licensePlate: 'FD-001',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        capacity: 2500.00,
        status: 'AVAILABLE',
        tenantId,
      },
      {
        licensePlate: 'FD-002',
        make: 'Mercedes',
        model: 'Sprinter',
        year: 2022,
        capacity: 3500.00,
        status: 'IN_USE',
        tenantId,
      },
      {
        licensePlate: 'FD-ERR',
        make: 'Broken',
        model: 'Vehicle',
        year: 2020,
        capacity: 0.00,
        status: 'MAINTENANCE',
        tenantId,
      },
    ],
    skipDuplicates: true,
  });

  // Create drivers including inactive
  await prisma.driver.createMany({
    data: [
      {
        name: 'John Smith',
        licenseNumber: 'DL-12345',
        phone: '+1-555-0101',
        email: 'john@fleet.test',
        status: 'ACTIVE',
        tenantId,
        costPerMile: 1.50,
      },
      {
        name: 'Jane Doe',
        licenseNumber: 'DL-67890',
        phone: '+1-555-0102',
        email: 'jane@fleet.test',
        status: 'ACTIVE',
        tenantId,
        costPerMile: 1.75,
      },
      {
        name: 'Suspended Driver',
        licenseNumber: 'DL-00000',
        phone: '+1-555-0199',
        email: 'suspended@fleet.test',
        status: 'SUSPENDED',
        tenantId,
        costPerMile: 0.00,
      },
    ],
    skipDuplicates: true,
  });

  // Create routes
  await prisma.route.createMany({
    data: [
      {
        name: 'Downtown Loop',
        description: 'Standard downtown delivery route',
        status: 'ACTIVE',
        distance: 25.50,
        estimatedTime: 120,
        tenantId,
      },
      {
        name: 'Suburban Express',
        description: 'Quick suburban delivery route',
        status: 'PLANNED',
        distance: 45.00,
        estimatedTime: 90,
        tenantId,
      },
      {
        name: 'Cancelled Route',
        description: 'This route was cancelled',
        status: 'CANCELLED',
        distance: 10.00,
        estimatedTime: 30,
        tenantId,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    return prisma.$disconnect();
  })
  .catch((error: Error) => {
    console.error('Seed failed:', error);
    return prisma.$disconnect().then(() => {
      process.exit(1);
    });
  });
