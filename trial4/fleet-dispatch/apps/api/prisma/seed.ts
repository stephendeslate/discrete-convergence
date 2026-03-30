// TRACED:FD-INF-002 — Seed with BCRYPT_SALT_ROUNDS from shared, error handling, failure state data
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const company = await prisma.company.create({
    data: { name: 'Demo Dispatch Co' },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@demo.com',
      passwordHash,
      role: 'DISPATCHER',
      companyId: company.id,
    },
  });

  const techUser = await prisma.user.create({
    data: {
      email: 'tech@demo.com',
      passwordHash,
      role: 'TECHNICIAN',
      companyId: company.id,
    },
  });

  const technician = await prisma.technician.create({
    data: {
      userId: techUser.id,
      companyId: company.id,
      skills: ['plumbing', 'electrical'],
      available: true,
      latitude: 40.7128000,
      longitude: -74.0060000,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      name: 'Jane Customer',
      email: 'customer@demo.com',
      phone: '+1-555-0100',
      address: '123 Main St, New York, NY 10001',
      companyId: company.id,
      latitude: 40.7484000,
      longitude: -73.9857000,
    },
  });

  // Active work order
  await prisma.workOrder.create({
    data: {
      title: 'Fix leaky faucet',
      description: 'Kitchen sink faucet dripping constantly',
      status: 'ASSIGNED',
      priority: 'HIGH',
      companyId: company.id,
      technicianId: technician.id,
      customerId: customer.id,
      latitude: 40.7484000,
      longitude: -73.9857000,
    },
  });

  // Error/failure state data: cancelled work order
  await prisma.workOrder.create({
    data: {
      title: 'Cancelled electrical repair',
      description: 'Customer cancelled before arrival',
      status: 'CANCELLED',
      priority: 'MEDIUM',
      companyId: company.id,
      customerId: customer.id,
    },
  });

  // Unassigned work order
  await prisma.workOrder.create({
    data: {
      title: 'Install thermostat',
      description: 'Smart thermostat installation',
      status: 'UNASSIGNED',
      priority: 'LOW',
      companyId: company.id,
      customerId: customer.id,
      latitude: 40.7580000,
      longitude: -73.9855000,
    },
  });

  void admin;
  void dispatcher;
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
