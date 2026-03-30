import { PrismaClient, WorkOrderStatus, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

/**
 * Seed the database with demo data including error/failure states.
 * TRACED:FD-INFRA-001
 */
async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'FleetCo Services',
      address: '123 Main St, Springfield, IL 62701',
      phone: '(555) 123-4567',
    },
  });

  // Create users
  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'admin@fleetco.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'dispatcher@fleetco.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Dispatch',
      role: 'DISPATCHER',
    },
  });

  const techUser1 = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'tech1@fleetco.com',
      passwordHash,
      firstName: 'Bob',
      lastName: 'Technician',
      role: 'TECHNICIAN',
    },
  });

  const techUser2 = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'tech2@fleetco.com',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Field',
      role: 'TECHNICIAN',
    },
  });

  // Create technicians
  const tech1 = await prisma.technician.create({
    data: {
      companyId: company.id,
      userId: techUser1.id,
      skills: ['plumbing', 'electrical'],
      isAvailable: true,
      latitude: 39.7817,
      longitude: -89.6501,
    },
  });

  const tech2 = await prisma.technician.create({
    data: {
      companyId: company.id,
      userId: techUser2.id,
      skills: ['hvac', 'electrical'],
      isAvailable: false,
    },
  });

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 987-6543',
      address: '456 Oak Ave, Springfield, IL 62702',
      latitude: 39.7900,
      longitude: -89.6440,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      address: '789 Elm St, Springfield, IL 62703',
    },
  });

  // Create work orders — including various states and error states
  const wo1 = await prisma.workOrder.create({
    data: {
      companyId: company.id,
      customerId: customer1.id,
      technicianId: tech1.id,
      title: 'Fix leaky faucet',
      description: 'Kitchen faucet dripping constantly',
      status: WorkOrderStatus.ASSIGNED,
      priority: 'HIGH',
      scheduledAt: new Date('2026-03-25T09:00:00Z'),
    },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      companyId: company.id,
      customerId: customer2.id,
      title: 'HVAC inspection',
      description: 'Annual maintenance inspection',
      status: WorkOrderStatus.UNASSIGNED,
      priority: 'MEDIUM',
    },
  });

  // Completed work order
  const wo3 = await prisma.workOrder.create({
    data: {
      companyId: company.id,
      customerId: customer1.id,
      technicianId: tech1.id,
      title: 'Electrical panel upgrade',
      description: 'Upgrade from 100A to 200A panel',
      status: WorkOrderStatus.COMPLETED,
      priority: 'HIGH',
      completedAt: new Date('2026-03-20T16:00:00Z'),
    },
  });

  // Cancelled work order — error/failure state data
  await prisma.workOrder.create({
    data: {
      companyId: company.id,
      customerId: customer2.id,
      title: 'Cancelled: Water heater install',
      description: 'Customer cancelled — moved out',
      status: WorkOrderStatus.CANCELLED,
      priority: 'LOW',
    },
  });

  // Status history for assigned work order
  await prisma.workOrderStatusHistory.create({
    data: {
      workOrderId: wo1.id,
      fromStatus: WorkOrderStatus.UNASSIGNED,
      toStatus: WorkOrderStatus.ASSIGNED,
      changedBy: dispatcher.id,
      note: 'Assigned to Bob',
    },
  });

  // Invoice — including VOID (failure state)
  await prisma.invoice.create({
    data: {
      companyId: company.id,
      workOrderId: wo3.id,
      invoiceNo: 'INV-00001',
      status: InvoiceStatus.SENT,
      subtotal: 1500.00,
      tax: 150.00,
      total: 1650.00,
      issuedAt: new Date('2026-03-21T10:00:00Z'),
      lineItems: {
        create: [
          {
            type: 'LABOR',
            description: 'Electrical panel upgrade labor (8 hours)',
            quantity: 8,
            unitPrice: 125.00,
            total: 1000.00,
          },
          {
            type: 'MATERIAL',
            description: '200A electrical panel',
            quantity: 1,
            unitPrice: 500.00,
            total: 500.00,
          },
        ],
      },
    },
  });

  // Audit log entries
  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      userId: admin.id,
      action: 'CREATE',
      entityType: 'WorkOrder',
      entityId: wo1.id,
      newValue: JSON.stringify({ title: wo1.title }),
    },
  });

  // Notification
  await prisma.notification.create({
    data: {
      companyId: company.id,
      userId: techUser1.id,
      type: 'EMAIL',
      subject: 'New work order assigned',
      body: `You have been assigned to: ${wo1.title}`,
      sentAt: new Date(),
    },
  });
}

main()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      process.stderr.write(`Seed error: ${error.message}\n`);
    } else {
      process.stderr.write('Seed error: unknown error\n');
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
