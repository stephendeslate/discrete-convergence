import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@fleet.test' },
    update: {},
    create: {
      email: 'admin@fleet.test',
      passwordHash,
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
      passwordHash,
      role: 'DISPATCHER',
      tenantId,
    },
  });

  // Create regular user
  await prisma.user.upsert({
    where: { email: 'user@fleet.test' },
    update: {},
    create: {
      email: 'user@fleet.test',
      passwordHash,
      role: 'USER',
      tenantId,
    },
  });

  // Create vehicles including one in error/failure state (RETIRED)
  const vehicle1 = await prisma.vehicle.create({
    data: {
      vin: '1HGBH41JXMN109186',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      status: 'ACTIVE',
      mileage: 15000,
      tenantId,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      vin: '2HGBH41JXMN109187',
      make: 'Chevrolet',
      model: 'Express',
      year: 2022,
      status: 'MAINTENANCE',
      mileage: 85000,
      tenantId,
    },
  });

  // Error state vehicle - retired due to accident
  const vehicleRetired = await prisma.vehicle.create({
    data: {
      vin: '3HGBH41JXMN109188',
      make: 'Dodge',
      model: 'Sprinter',
      year: 2019,
      status: 'RETIRED',
      mileage: 250000,
      tenantId,
    },
  });

  // Create drivers including one in error/failure state (TERMINATED)
  const driver1 = await prisma.driver.create({
    data: {
      licenseNumber: 'DL-001-2023',
      name: 'John Smith',
      status: 'ACTIVE',
      certifications: ['CDL-A', 'HAZMAT'],
      tenantId,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      licenseNumber: 'DL-002-2023',
      name: 'Jane Doe',
      status: 'ON_LEAVE',
      certifications: ['CDL-B'],
      tenantId,
    },
  });

  // Error state driver - terminated
  await prisma.driver.create({
    data: {
      licenseNumber: 'DL-003-2023',
      name: 'Bob Terminated',
      status: 'TERMINATED',
      certifications: [],
      tenantId,
    },
  });

  // Create routes
  const route1 = await prisma.route.create({
    data: {
      name: 'Downtown Express',
      origin: 'Warehouse A',
      destination: 'Downtown Hub',
      distance: 25.5,
      estimatedDuration: 45,
      tenantId,
    },
  });

  // Create trips including cancelled (error state)
  await prisma.trip.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      routeId: route1.id,
      status: 'COMPLETED',
      startTime: new Date('2024-01-01T08:00:00Z'),
      endTime: new Date('2024-01-01T09:00:00Z'),
      tenantId,
    },
  });

  // Error state trip - cancelled
  await prisma.trip.create({
    data: {
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      routeId: route1.id,
      status: 'CANCELLED',
      startTime: new Date('2024-01-02T08:00:00Z'),
      tenantId,
    },
  });

  // Create maintenance records including emergency (error state)
  await prisma.maintenance.create({
    data: {
      vehicleId: vehicle1.id,
      type: 'SCHEDULED',
      cost: 350.0,
      date: new Date('2024-01-15'),
      notes: 'Regular oil change and tire rotation',
      tenantId,
    },
  });

  // Error state maintenance - emergency
  await prisma.maintenance.create({
    data: {
      vehicleId: vehicleRetired.id,
      type: 'EMERGENCY',
      cost: 8500.0,
      date: new Date('2024-01-10'),
      notes: 'Engine failure - vehicle retired after assessment',
      tenantId,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
