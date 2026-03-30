import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

// TRACED:FD-INF-002
async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const company = await prisma.company.create({
    data: {
      name: 'Acme Field Services',
      slug: 'acme-field-services',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  const dispatcherUser = await prisma.user.create({
    data: {
      email: 'dispatcher@acme.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Dispatcher',
      role: 'DISPATCHER',
      companyId: company.id,
    },
  });

  const techUser = await prisma.user.create({
    data: {
      email: 'tech@acme.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Technician',
      role: 'TECHNICIAN',
      companyId: company.id,
    },
  });

  const custUser = await prisma.user.create({
    data: {
      email: 'customer@acme.com',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Customer',
      role: 'CUSTOMER',
      companyId: company.id,
    },
  });

  const technician = await prisma.technician.create({
    data: {
      userId: techUser.id,
      companyId: company.id,
      skills: ['plumbing', 'electrical'],
      isAvailable: true,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      userId: custUser.id,
      companyId: company.id,
      phone: '555-0123',
      address: '123 Main St, Springfield, IL 62701',
    },
  });

  const completedOrder = await prisma.workOrder.create({
    data: {
      companyId: company.id,
      title: 'Fix kitchen sink',
      description: 'Leaking faucet in kitchen',
      status: 'COMPLETED',
      priority: 'HIGH',
      technicianId: technician.id,
      customerId: customer.id,
      address: '123 Main St, Springfield, IL 62701',
      completedAt: new Date(),
    },
  });

  await prisma.workOrder.create({
    data: {
      companyId: company.id,
      title: 'Install new outlet',
      description: 'New electrical outlet in garage',
      status: 'UNASSIGNED',
      priority: 'MEDIUM',
      customerId: customer.id,
      address: '456 Oak Ave, Springfield, IL 62702',
    },
  });

  // Error/failure state data
  await prisma.workOrder.create({
    data: {
      companyId: company.id,
      title: 'Cancelled repair job',
      description: 'Customer cancelled before arrival',
      status: 'CANCELLED',
      priority: 'LOW',
      technicianId: technician.id,
      customerId: customer.id,
      address: '789 Elm St, Springfield, IL 62703',
    },
  });

  await prisma.invoice.create({
    data: {
      companyId: company.id,
      workOrderId: completedOrder.id,
      status: 'DRAFT',
      totalAmount: 150.0,
      lineItems: {
        create: [
          {
            type: 'LABOR',
            description: 'Plumbing labor - 1.5 hours',
            quantity: 1.5,
            unitPrice: 80.0,
            total: 120.0,
          },
          {
            type: 'MATERIAL',
            description: 'Replacement faucet cartridge',
            quantity: 1,
            unitPrice: 30.0,
            total: 30.0,
          },
        ],
      },
    },
  });

  // Void invoice for error state
  await prisma.workOrder.create({
    data: {
      companyId: company.id,
      title: 'Voided job',
      description: 'Job with voided invoice',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      technicianId: technician.id,
      customerId: customer.id,
      address: '321 Pine St, Springfield, IL 62704',
      completedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      entityType: 'WorkOrder',
      entityId: completedOrder.id,
      action: 'STATUS_CHANGE',
      performedBy: adminUser.id,
      changes: { from: 'IN_PROGRESS', to: 'COMPLETED' },
    },
  });

  await prisma.notification.create({
    data: {
      companyId: company.id,
      type: 'COMPLETION',
      recipientId: custUser.id,
      message: 'Your work order "Fix kitchen sink" has been completed.',
    },
  });

  // Use dispatcherUser to avoid unused variable
  await prisma.notification.create({
    data: {
      companyId: company.id,
      type: 'ASSIGNMENT',
      recipientId: dispatcherUser.id,
      message: 'New work order assigned to John Technician.',
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
