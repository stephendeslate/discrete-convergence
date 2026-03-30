import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'seed-tenant-001';
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'admin@fleet.test' },
    update: {},
    create: {
      email: 'admin@fleet.test',
      password: passwordHash,
      role: 'ADMIN',
      tenantId,
    },
  });

  await prisma.user.upsert({
    where: { email: 'dispatcher@fleet.test' },
    update: {},
    create: {
      email: 'dispatcher@fleet.test',
      password: passwordHash,
      role: 'DISPATCHER',
      tenantId,
    },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@fleet.test' },
    update: {},
    create: {
      email: 'viewer@fleet.test',
      password: passwordHash,
      role: 'VIEWER',
      tenantId,
    },
  });

  // Seed error/failure state data
  await prisma.vehicle.create({
    data: {
      name: 'Retired Truck',
      licensePlate: 'RETIRED-001',
      make: 'Ford',
      model: 'F-150',
      year: 2015,
      status: 'RETIRED',
      mileage: 250000,
      costPerMile: 0.65,
      tenantId,
    },
  });

  await prisma.vehicle.create({
    data: {
      name: 'Maintenance Van',
      licensePlate: 'MAINT-001',
      make: 'Toyota',
      model: 'Hiace',
      year: 2020,
      status: 'MAINTENANCE',
      mileage: 80000,
      costPerMile: 0.45,
      tenantId,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Seed failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
