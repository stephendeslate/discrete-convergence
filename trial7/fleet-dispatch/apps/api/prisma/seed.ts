import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

// TRACED:FD-INFRA-004
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenant = await prisma.tenant.create({
    data: { name: 'Demo Fleet Corp' },
  });

  const adminHash = await bcrypt.hash('Admin123!', BCRYPT_SALT_ROUNDS);
  const dispatcherHash = await bcrypt.hash('Dispatch123!', BCRYPT_SALT_ROUNDS);

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@fleetdispatch.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      name: 'Fleet Admin',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'dispatcher@fleetdispatch.com',
      passwordHash: dispatcherHash,
      role: 'DISPATCHER',
      name: 'Main Dispatcher',
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      tenantId: tenant.id,
      licensePlate: 'FL-001',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      status: 'AVAILABLE',
      mileage: 15000,
      fuelCostPerKm: 0.15,
    },
  });

  // Failure state: retired vehicle
  await prisma.vehicle.create({
    data: {
      tenantId: tenant.id,
      licensePlate: 'FL-RETIRED',
      make: 'Chevrolet',
      model: 'Express',
      year: 2015,
      status: 'RETIRED',
      mileage: 350000,
      fuelCostPerKm: 0.25,
    },
  });

  const driver = await prisma.driver.create({
    data: {
      tenantId: tenant.id,
      name: 'John Smith',
      licenseNumber: 'DL-12345',
      phone: '+1-555-0100',
      status: 'ACTIVE',
    },
  });

  // Failure state: terminated driver
  await prisma.driver.create({
    data: {
      tenantId: tenant.id,
      name: 'Jane Doe',
      licenseNumber: 'DL-99999',
      phone: '+1-555-0199',
      status: 'TERMINATED',
    },
  });

  const route = await prisma.route.create({
    data: {
      tenantId: tenant.id,
      name: 'Downtown Express',
      origin: 'Warehouse A',
      destination: 'Distribution Center B',
      distanceKm: 45.5,
      status: 'ACTIVE',
    },
  });

  // Failure state: cancelled route
  await prisma.route.create({
    data: {
      tenantId: tenant.id,
      name: 'Cancelled Route',
      origin: 'Depot X',
      destination: 'Depot Y',
      distanceKm: 100.0,
      status: 'CANCELLED',
    },
  });

  await prisma.dispatch.create({
    data: {
      tenantId: tenant.id,
      vehicleId: vehicle.id,
      driverId: driver.id,
      routeId: route.id,
      dispatcherId: (await prisma.user.findFirst({ where: { role: 'DISPATCHER' } }))!.id,
      status: 'PENDING',
      scheduledAt: new Date('2026-04-01T08:00:00Z'),
      notes: 'Standard morning delivery',
    },
  });

  // Failure state: failed dispatch
  await prisma.dispatch.create({
    data: {
      tenantId: tenant.id,
      vehicleId: vehicle.id,
      driverId: driver.id,
      routeId: route.id,
      dispatcherId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))!.id,
      status: 'FAILED',
      scheduledAt: new Date('2026-03-15T08:00:00Z'),
      notes: 'Vehicle breakdown en route',
      totalCost: 150.00,
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      tenantId: tenant.id,
      vehicleId: vehicle.id,
      type: 'PREVENTIVE',
      description: 'Regular oil change and inspection',
      cost: 250.00,
      performedAt: new Date('2026-03-01T10:00:00Z'),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
