// TRACED:FD-DATA-008 — Seed with error handling, BCRYPT_SALT_ROUNDS from shared, failure state data
// TRACED:FD-DATA-005 — Seed exercises RLS migration by inserting tenant-scoped data
// TRACED:FD-CROSS-004 — Shared package consumed: BCRYPT_SALT_ROUNDS import
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const tenantId = 'seed-tenant-001';

  await prisma.user.create({
    data: {
      email: 'admin@fleet.local',
      passwordHash,
      role: 'ADMIN',
      tenantId,
    },
  });

  await prisma.user.create({
    data: {
      email: 'dispatcher@fleet.local',
      passwordHash,
      role: 'DISPATCHER',
      tenantId,
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      licensePlate: 'FL-001',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      status: 'AVAILABLE',
      mileage: 15000,
      fuelCapacity: 80.00,
      tenantId,
    },
  });

  const retiredVehicle = await prisma.vehicle.create({
    data: {
      licensePlate: 'FL-002',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2018,
      status: 'RETIRED',
      mileage: 250000,
      fuelCapacity: 75.50,
      tenantId,
    },
  });

  const driver = await prisma.driver.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      licenseNumber: 'DL-12345',
      phone: '+1-555-0100',
      status: 'AVAILABLE',
      tenantId,
    },
  });

  const suspendedDriver = await prisma.driver.create({
    data: {
      firstName: 'Jane',
      lastName: 'Doe',
      licenseNumber: 'DL-67890',
      phone: '+1-555-0101',
      status: 'SUSPENDED',
      tenantId,
    },
  });

  const route = await prisma.route.create({
    data: {
      name: 'Warehouse to Downtown',
      origin: '123 Warehouse Blvd',
      destination: '456 Downtown Ave',
      distanceKm: 25.50,
      estimatedTime: 45,
      status: 'ACTIVE',
      tenantId,
    },
  });

  await prisma.dispatch.create({
    data: {
      status: 'DELIVERED',
      priority: 1,
      notes: 'Regular delivery completed',
      vehicleId: vehicle.id,
      driverId: driver.id,
      routeId: route.id,
      tenantId,
      scheduledAt: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 82800000),
    },
  });

  // Seed failure state data for testing error scenarios
  await prisma.dispatch.create({
    data: {
      status: 'FAILED',
      priority: 3,
      notes: 'Vehicle breakdown en route — dispatch failed',
      vehicleId: vehicle.id,
      driverId: driver.id,
      routeId: route.id,
      tenantId,
      scheduledAt: new Date(Date.now() - 172800000),
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      type: 'ROUTINE',
      status: 'COMPLETED',
      description: 'Oil change and tire rotation',
      cost: 450.00,
      vehicleId: vehicle.id,
      tenantId,
      scheduledAt: new Date(Date.now() - 604800000),
      completedAt: new Date(Date.now() - 600000000),
    },
  });

  // Failure state: emergency maintenance
  await prisma.maintenanceRecord.create({
    data: {
      type: 'EMERGENCY',
      status: 'IN_PROGRESS',
      description: 'Brake system failure detected during inspection',
      cost: 2500.00,
      vehicleId: retiredVehicle.id,
      tenantId,
      scheduledAt: new Date(),
    },
  });

  void suspendedDriver;
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
