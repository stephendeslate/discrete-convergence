import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Seed admin user
  await prisma.user.upsert({
    where: { email: 'admin@fleet.example.com' },
    update: {},
    create: {
      email: 'admin@fleet.example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId,
    },
  });

  // Seed viewer user
  await prisma.user.upsert({
    where: { email: 'viewer@fleet.example.com' },
    update: {},
    create: {
      email: 'viewer@fleet.example.com',
      passwordHash,
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId,
    },
  });

  // Seed dispatcher user
  await prisma.user.upsert({
    where: { email: 'dispatcher@fleet.example.com' },
    update: {},
    create: {
      email: 'dispatcher@fleet.example.com',
      passwordHash,
      name: 'Dispatch Operator',
      role: 'DISPATCHER',
      tenantId,
    },
  });

  // Seed vehicles - including one in error/maintenance state
  const vehicle1 = await prisma.vehicle.create({
    data: {
      licensePlate: 'FD-001-AA',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      status: 'ACTIVE',
      tenantId,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      licensePlate: 'FD-002-BB',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2022,
      status: 'MAINTENANCE',
      tenantId,
    },
  });

  await prisma.vehicle.create({
    data: {
      licensePlate: 'FD-003-CC',
      make: 'Chevrolet',
      model: 'Express',
      year: 2020,
      status: 'RETIRED',
      tenantId,
    },
  });

  // Seed drivers - including one in off-duty state
  const driver1 = await prisma.driver.create({
    data: {
      name: 'John Smith',
      email: 'john@fleet.example.com',
      licenseNumber: 'DL-12345',
      status: 'AVAILABLE',
      tenantId,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@fleet.example.com',
      licenseNumber: 'DL-67890',
      status: 'ON_DUTY',
      tenantId,
    },
  });

  await prisma.driver.create({
    data: {
      name: 'Bob Wilson',
      email: 'bob@fleet.example.com',
      licenseNumber: 'DL-11111',
      status: 'OFF_DUTY',
      tenantId,
    },
  });

  // Seed routes
  const route1 = await prisma.route.create({
    data: {
      name: 'Downtown Loop',
      origin: '123 Main St',
      destination: '456 Oak Ave',
      distance: 15.5,
      estimatedDuration: 30,
      tenantId,
    },
  });

  const route2 = await prisma.route.create({
    data: {
      name: 'Airport Shuttle',
      origin: 'Terminal A',
      destination: 'City Center Hotel',
      distance: 42.0,
      estimatedDuration: 55,
      tenantId,
    },
  });

  // Seed dispatches - including cancelled state for error data
  await prisma.dispatch.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      routeId: route1.id,
      status: 'PENDING',
      scheduledAt: new Date('2025-06-01T08:00:00Z'),
      tenantId,
    },
  });

  await prisma.dispatch.create({
    data: {
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      routeId: route2.id,
      status: 'IN_PROGRESS',
      scheduledAt: new Date('2025-05-15T10:00:00Z'),
      tenantId,
    },
  });

  await prisma.dispatch.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      routeId: route2.id,
      status: 'CANCELLED',
      scheduledAt: new Date('2025-04-01T06:00:00Z'),
      tenantId,
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
