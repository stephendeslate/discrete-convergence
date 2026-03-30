// TRACED:PRISMA-SEED
import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const companyId = '00000000-0000-0000-0000-000000000001';
  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT set_config('app.company_id', ${companyId}, true)`);

    await tx.user.upsert({
      where: { email_companyId: { email: 'admin@fleet.test', companyId } },
      update: {},
      create: {
        email: 'admin@fleet.test',
        passwordHash,
        role: 'ADMIN',
        companyId,
      },
    });

    await tx.vehicle.upsert({
      where: { vin_companyId: { vin: 'WBA3A5C55CF256789', companyId } },
      update: {},
      create: {
        vin: 'WBA3A5C55CF256789',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        status: 'ACTIVE',
        licensePlate: 'FD-001',
        companyId,
      },
    });

    await tx.driver.upsert({
      where: { email_companyId: { email: 'driver1@fleet.test', companyId } },
      update: {},
      create: {
        name: 'Jane Driver',
        email: 'driver1@fleet.test',
        licenseNumber: 'DL-12345',
        status: 'AVAILABLE',
        companyId,
      },
    });

    await tx.zone.create({
      data: {
        name: 'Downtown Zone',
        description: 'Central business district',
        polygon: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
        companyId,
      },
    }).catch(() => { /* ignore duplicate */ });
  });
}

main()
  .catch((e) => {
    process.stderr.write(`Seed error: ${String(e)}\n`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
