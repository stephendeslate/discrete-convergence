import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Fleet Corp',
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@demo.com',
        passwordHash,
        role: 'admin',
        tenantId: tenant.id,
      },
      {
        email: 'dispatcher@demo.com',
        passwordHash,
        role: 'dispatcher',
        tenantId: tenant.id,
      },
      {
        email: 'viewer@demo.com',
        passwordHash,
        role: 'viewer',
        tenantId: tenant.id,
      },
    ],
  });

  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        name: 'Truck Alpha',
        licensePlate: 'ABC-1234',
        make: 'Ford',
        model: 'F-150',
        year: 2023,
        status: 'available',
        mileage: 15000,
        costPerMile: 0.58,
        tenantId: tenant.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Van Beta',
        licensePlate: 'DEF-5678',
        make: 'Mercedes',
        model: 'Sprinter',
        year: 2022,
        status: 'in_use',
        mileage: 45000,
        costPerMile: 0.72,
        tenantId: tenant.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Sedan Gamma',
        licensePlate: 'GHI-9012',
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        status: 'maintenance',
        mileage: 5000,
        costPerMile: 0.35,
        tenantId: tenant.id,
      },
    }),
  ]);

  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@demo.com',
        phone: '555-0101',
        licenseNumber: 'DL-001',
        status: 'active',
        hourlyRate: 25.0,
        tenantId: tenant.id,
      },
    }),
    prisma.driver.create({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@demo.com',
        phone: '555-0102',
        licenseNumber: 'DL-002',
        status: 'active',
        hourlyRate: 28.5,
        tenantId: tenant.id,
      },
    }),
    prisma.driver.create({
      data: {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@demo.com',
        phone: '555-0103',
        licenseNumber: 'DL-003',
        status: 'suspended',
        hourlyRate: 22.0,
        tenantId: tenant.id,
      },
    }),
  ]);

  const routes = await Promise.all([
    prisma.route.create({
      data: {
        name: 'Downtown Express',
        description: 'Direct route through downtown',
        origin: '100 Main St',
        destination: '500 Oak Ave',
        distance: 15.5,
        estimatedDuration: 30,
        status: 'active',
        tenantId: tenant.id,
      },
    }),
    prisma.route.create({
      data: {
        name: 'Highway Loop',
        description: 'Highway bypass route',
        origin: '200 Elm St',
        destination: '800 Pine Dr',
        distance: 42.3,
        estimatedDuration: 45,
        status: 'active',
        tenantId: tenant.id,
      },
    }),
    prisma.route.create({
      data: {
        name: 'Cancelled Route',
        description: 'This route was cancelled',
        origin: '300 Maple Ave',
        destination: '600 Cedar Ln',
        distance: 8.0,
        estimatedDuration: 15,
        status: 'cancelled',
        tenantId: tenant.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.dispatch.create({
      data: {
        title: 'Morning Delivery',
        description: 'Package delivery to downtown offices',
        status: 'completed',
        priority: 1,
        scheduledAt: new Date('2024-01-15T08:00:00Z'),
        startedAt: new Date('2024-01-15T08:15:00Z'),
        completedAt: new Date('2024-01-15T09:30:00Z'),
        estimatedCost: 45.0,
        actualCost: 42.5,
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        routeId: routes[0].id,
        tenantId: tenant.id,
      },
    }),
    prisma.dispatch.create({
      data: {
        title: 'Afternoon Pickup',
        description: 'Warehouse pickup and transfer',
        status: 'in_progress',
        priority: 2,
        scheduledAt: new Date('2024-01-15T14:00:00Z'),
        startedAt: new Date('2024-01-15T14:10:00Z'),
        estimatedCost: 85.0,
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        routeId: routes[1].id,
        tenantId: tenant.id,
      },
    }),
    prisma.dispatch.create({
      data: {
        title: 'Failed Dispatch',
        description: 'This dispatch was cancelled due to vehicle issue',
        status: 'cancelled',
        priority: 3,
        scheduledAt: new Date('2024-01-16T10:00:00Z'),
        estimatedCost: 60.0,
        tenantId: tenant.id,
      },
    }),
    prisma.dispatch.create({
      data: {
        title: 'Pending Assignment',
        description: 'Awaiting driver and vehicle assignment',
        status: 'pending',
        priority: 1,
        scheduledAt: new Date('2024-01-17T09:00:00Z'),
        estimatedCost: 55.0,
        tenantId: tenant.id,
      },
    }),
  ]);
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
