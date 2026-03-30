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
      name: 'Fleet Admin',
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
      name: 'John Dispatcher',
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
      name: 'Jane Driver',
      role: 'DRIVER',
      tenantId,
    },
  });

  // Create vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      licensePlate: 'FL-001',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      status: 'AVAILABLE',
      mileage: 15000,
      fuelCapacity: 80.0,
      costPerMile: 0.45,
      tenantId,
    },
  });

  // Vehicle in maintenance state (error/failure data)
  const vehicle2 = await prisma.vehicle.create({
    data: {
      licensePlate: 'FL-002',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2022,
      status: 'MAINTENANCE',
      mileage: 45000,
      fuelCapacity: 100.0,
      costPerMile: 0.55,
      tenantId,
    },
  });

  // Retired vehicle (failure state)
  await prisma.vehicle.create({
    data: {
      licensePlate: 'FL-003',
      make: 'Chevrolet',
      model: 'Express',
      year: 2018,
      status: 'RETIRED',
      mileage: 200000,
      fuelCapacity: 75.0,
      costPerMile: 0.65,
      tenantId,
    },
  });

  // Create drivers
  const driver1 = await prisma.driver.create({
    data: {
      name: 'Mike Johnson',
      email: 'mike@fleet.test',
      phone: '+1-555-0101',
      licenseNumber: 'DL-12345',
      status: 'AVAILABLE',
      hourlyRate: 25.0,
      tenantId,
    },
  });

  // Suspended driver (failure state)
  await prisma.driver.create({
    data: {
      name: 'Bob Suspended',
      email: 'bob@fleet.test',
      phone: '+1-555-0102',
      licenseNumber: 'DL-99999',
      status: 'SUSPENDED',
      hourlyRate: 20.0,
      tenantId,
    },
  });

  // Create routes
  const route1 = await prisma.route.create({
    data: {
      name: 'Downtown Express',
      origin: '123 Warehouse Ave',
      destination: '456 Downtown Blvd',
      distanceMiles: 15.5,
      estimatedTime: 30,
      tenantId,
    },
  });

  // Create dispatches
  await prisma.dispatch.create({
    data: {
      status: 'COMPLETED',
      scheduledAt: new Date('2024-01-15T08:00:00Z'),
      startedAt: new Date('2024-01-15T08:05:00Z'),
      completedAt: new Date('2024-01-15T08:45:00Z'),
      notes: 'Delivered on time',
      totalCost: 25.50,
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      routeId: route1.id,
      tenantId,
    },
  });

  // Cancelled dispatch (failure state)
  await prisma.dispatch.create({
    data: {
      status: 'CANCELLED',
      scheduledAt: new Date('2024-01-16T10:00:00Z'),
      notes: 'Cancelled due to vehicle breakdown',
      totalCost: 0,
      vehicleId: vehicle2.id,
      driverId: driver1.id,
      routeId: route1.id,
      tenantId,
    },
  });

  // Create maintenance records
  await prisma.maintenance.create({
    data: {
      description: 'Oil change and tire rotation',
      status: 'COMPLETED',
      scheduledAt: new Date('2024-01-10T09:00:00Z'),
      completedAt: new Date('2024-01-10T11:00:00Z'),
      cost: 150.0,
      vehicleId: vehicle1.id,
      tenantId,
    },
  });

  // Scheduled maintenance
  await prisma.maintenance.create({
    data: {
      description: 'Brake pad replacement',
      status: 'SCHEDULED',
      scheduledAt: new Date('2024-02-01T09:00:00Z'),
      cost: 400.0,
      vehicleId: vehicle2.id,
      tenantId,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Seed failed:', message);
    await prisma.$disconnect();
    process.exit(1);
  });
