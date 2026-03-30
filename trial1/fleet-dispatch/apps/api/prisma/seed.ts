// TRACED:FD-INF-001 — Seed with BCRYPT_SALT_ROUNDS from shared, error handling
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const company = await prisma.company.create({
    data: { name: 'Acme Field Services' },
  });

  const tenantId = company.id;
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Seed users with different roles for the demo tenant
  const seedUsers = [
    { email: 'admin@acme.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN' as const },
    { email: 'dispatcher@acme.com', firstName: 'Dispatch', lastName: 'User', role: 'DISPATCHER' as const },
  ];

  for (const seedUser of seedUsers) {
    await prisma.user.create({
      data: { ...seedUser, passwordHash, companyId: tenantId },
    });
  }

  // Inactive user for edge case testing
  await prisma.user.create({
    data: {
      email: 'inactive@acme.com',
      passwordHash,
      firstName: 'Inactive',
      lastName: 'User',
      role: 'TECHNICIAN',
      isActive: false,
      companyId: tenantId,
    },
  });

  const tech = await prisma.technician.create({
    data: {
      name: 'John Tech',
      phone: '555-0100',
      skills: ['plumbing', 'electrical'],
      latitude: 40.7128,
      longitude: -74.006,
      companyId: tenantId,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      name: 'Jane Customer',
      email: 'jane@example.com',
      phone: '555-0200',
      address: '123 Main St',
      companyId: tenantId,
    },
  });

  // Normal work order
  await prisma.workOrder.create({
    data: {
      title: 'Fix kitchen sink',
      description: 'Leaking faucet',
      status: 'ASSIGNED',
      priority: 'HIGH',
      technicianId: tech.id,
      customerId: customer.id,
      companyId: tenantId,
    },
  });

  // Cancelled work order (failure state data)
  await prisma.workOrder.create({
    data: {
      title: 'Cancelled repair',
      description: 'Customer cancelled',
      status: 'CANCELLED',
      priority: 'LOW',
      companyId: tenantId,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
