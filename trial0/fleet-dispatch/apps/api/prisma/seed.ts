// TRACED:FD-SEED-001
// TRACED:FD-SEED-002
import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  const company = await prisma.company.create({
    data: {
      name: 'Demo Dispatch Co',
      slug: 'demo-dispatch',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashPassword('password123'),
      name: 'Admin User',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  const dispatcherUser = await prisma.user.create({
    data: {
      email: 'dispatcher@demo.com',
      password: hashPassword('password123'),
      name: 'Dispatch User',
      role: 'DISPATCHER',
      companyId: company.id,
    },
  });

  const techUser1 = await prisma.user.create({
    data: {
      email: 'tech1@demo.com',
      password: hashPassword('password123'),
      name: 'Alice Technician',
      role: 'TECHNICIAN',
      companyId: company.id,
    },
  });

  const techUser2 = await prisma.user.create({
    data: {
      email: 'tech2@demo.com',
      password: hashPassword('password123'),
      name: 'Bob Technician',
      role: 'TECHNICIAN',
      companyId: company.id,
    },
  });

  const tech1 = await prisma.technician.create({
    data: {
      userId: techUser1.id,
      companyId: company.id,
      skills: ['plumbing', 'electrical'],
      latitude: 40.7128,
      longitude: -74.006,
      isAvailable: true,
    },
  });

  const tech2 = await prisma.technician.create({
    data: {
      userId: techUser2.id,
      companyId: company.id,
      skills: ['hvac', 'electrical'],
      latitude: 40.7589,
      longitude: -73.9851,
      isAvailable: true,
    },
  });

  const customer1 = await prisma.customer.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+15551234567',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      latitude: 40.7484,
      longitude: -73.9967,
      companyId: company.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      address: '456 Oak Ave',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      latitude: 40.7282,
      longitude: -73.7949,
      companyId: company.id,
    },
  });

  const wo1 = await prisma.workOrder.create({
    data: {
      sequenceNumber: 1,
      title: 'Fix leaky faucet',
      description: 'Kitchen faucet dripping constantly',
      status: 'ASSIGNED',
      priority: 'HIGH',
      scheduledStart: new Date('2025-01-15T09:00:00Z'),
      scheduledEnd: new Date('2025-01-15T11:00:00Z'),
      companyId: company.id,
      customerId: customer1.id,
      technicianId: tech1.id,
    },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      sequenceNumber: 2,
      title: 'Install ceiling fan',
      description: 'New ceiling fan in living room',
      status: 'UNASSIGNED',
      priority: 'MEDIUM',
      companyId: company.id,
      customerId: customer2.id,
    },
  });

  const wo3 = await prisma.workOrder.create({
    data: {
      sequenceNumber: 3,
      title: 'HVAC maintenance',
      description: 'Annual furnace inspection',
      status: 'COMPLETED',
      priority: 'LOW',
      completedAt: new Date('2025-01-10T15:00:00Z'),
      companyId: company.id,
      customerId: customer1.id,
      technicianId: tech2.id,
    },
  });

  await prisma.workOrderStatusHistory.createMany({
    data: [
      { workOrderId: wo1.id, fromStatus: null, toStatus: 'UNASSIGNED', changedBy: admin.id },
      { workOrderId: wo1.id, fromStatus: 'UNASSIGNED', toStatus: 'ASSIGNED', changedBy: dispatcherUser.id },
      { workOrderId: wo3.id, fromStatus: null, toStatus: 'UNASSIGNED', changedBy: admin.id },
      { workOrderId: wo3.id, fromStatus: 'UNASSIGNED', toStatus: 'ASSIGNED', changedBy: dispatcherUser.id },
      { workOrderId: wo3.id, fromStatus: 'ASSIGNED', toStatus: 'COMPLETED', changedBy: techUser2.id },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        companyId: company.id,
        type: 'ASSIGNMENT',
        channel: 'EMAIL',
        recipient: techUser1.email,
        subject: 'New Job Assignment',
        body: 'You have been assigned to: Fix leaky faucet',
        status: 'SENT',
        sentAt: new Date(),
      },
      {
        companyId: company.id,
        type: 'COMPLETION',
        channel: 'EMAIL',
        recipient: customer1.email,
        subject: 'Service Completed',
        body: 'HVAC maintenance has been completed',
        status: 'SENT',
        sentAt: new Date(),
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      userId: admin.id,
      action: 'CREATE',
      entity: 'WorkOrder',
      entityId: wo1.id,
      changes: JSON.stringify({ title: 'Fix leaky faucet' }),
    },
  });

  process.stderr.write('Seed completed successfully\n');
}

main()
  .catch((error: Error) => {
    process.stderr.write(`Seed failed: ${error.message}\n`);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
