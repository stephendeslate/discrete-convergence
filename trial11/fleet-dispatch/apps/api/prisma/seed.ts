import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

// TRACED: FD-INFRA-008
const prisma = new PrismaClient();

async function main() {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const adminHash = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
  const dispatcherHash = await bcrypt.hash('dispatcher123', BCRYPT_SALT_ROUNDS);
  const driverHash = await bcrypt.hash('driver123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fleet.com' },
    update: {},
    create: {
      email: 'admin@fleet.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      tenantId,
    },
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@fleet.com' },
    update: {},
    create: {
      email: 'dispatcher@fleet.com',
      passwordHash: dispatcherHash,
      role: 'DISPATCHER',
      tenantId,
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@fleet.com' },
    update: {},
    create: {
      email: 'driver@fleet.com',
      passwordHash: driverHash,
      role: 'DRIVER',
      tenantId,
    },
  });

  const vehicle1 = await prisma.vehicle.create({
    data: {
      name: 'Truck Alpha',
      licensePlate: 'ABC-1234',
      status: 'AVAILABLE',
      mileage: 15000.5,
      tenantId,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      name: 'Van Beta',
      licensePlate: 'DEF-5678',
      status: 'IN_USE',
      mileage: 32000.75,
      tenantId,
    },
  });

  // Error/failure state: retired vehicle
  await prisma.vehicle.create({
    data: {
      name: 'Old Truck Gamma',
      licensePlate: 'GHI-9012',
      status: 'RETIRED',
      mileage: 250000.0,
      tenantId,
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      name: 'John Driver',
      licenseNumber: 'DL-001-2024',
      phone: '+1-555-0101',
      status: 'ACTIVE',
      tenantId,
      userId: driverUser.id,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: 'Jane Hauler',
      licenseNumber: 'DL-002-2024',
      phone: '+1-555-0102',
      status: 'ACTIVE',
      tenantId,
    },
  });

  // Error/failure state: inactive driver
  await prisma.driver.create({
    data: {
      name: 'Bob Inactive',
      licenseNumber: 'DL-003-2024',
      phone: '+1-555-0103',
      status: 'INACTIVE',
      tenantId,
    },
  });

  await prisma.dispatch.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      origin: '123 Warehouse St',
      destination: '456 Customer Ave',
      status: 'PENDING',
      scheduledAt: new Date('2024-06-15T09:00:00Z'),
      cost: 150.0,
      tenantId,
    },
  });

  await prisma.dispatch.create({
    data: {
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      origin: '789 Depot Rd',
      destination: '321 Delivery Ln',
      status: 'IN_TRANSIT',
      scheduledAt: new Date('2024-06-15T10:00:00Z'),
      cost: 275.5,
      notes: 'Fragile cargo - handle with care',
      tenantId,
    },
  });

  // Error/failure state: cancelled dispatch
  await prisma.dispatch.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver2.id,
      origin: '100 Origin St',
      destination: '200 Cancelled Ave',
      status: 'CANCELLED',
      scheduledAt: new Date('2024-06-14T08:00:00Z'),
      cost: 0,
      notes: 'Customer cancelled order',
      tenantId,
    },
  });

  process.stdout.write(`Seeded: ${admin.email}, ${dispatcher.email}, ${driverUser.email}\n`);
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${String(e)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
