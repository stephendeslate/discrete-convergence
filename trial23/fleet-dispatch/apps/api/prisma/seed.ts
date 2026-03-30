// TRACED: FD-CROSS-004 — Prisma seed populates all entity types with cross-company isolation
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

async function main() {
  console.log('Seeding database...');

  const passwordHash = await hashPassword('Test1234!');

  // -------------------------------------------------------------------------
  // Companies
  // -------------------------------------------------------------------------
  const acmePlumbing = await prisma.company.create({
    data: {
      name: 'Acme Plumbing Co',
      domain: 'acmeplumbing.com',
    },
  });

  const swiftElectric = await prisma.company.create({
    data: {
      name: 'Swift Electric Services',
      domain: 'swiftelectric.com',
    },
  });

  // -------------------------------------------------------------------------
  // Users — Acme Plumbing
  // -------------------------------------------------------------------------
  const acmeAdmin = await prisma.user.create({
    data: {
      email: 'admin@acmeplumbing.com',
      passwordHash,
      name: 'Alice Acme',
      role: 'ADMIN',
      companyId: acmePlumbing.id,
    },
  });

  const acmeDispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@acmeplumbing.com',
      passwordHash,
      name: 'Dan Dispatcher',
      role: 'DISPATCHER',
      companyId: acmePlumbing.id,
    },
  });

  const acmeTechUser = await prisma.user.create({
    data: {
      email: 'tech@acmeplumbing.com',
      passwordHash,
      name: 'Tom Technician',
      role: 'TECHNICIAN',
      companyId: acmePlumbing.id,
    },
  });

  const acmeCustomerUser = await prisma.user.create({
    data: {
      email: 'customer@acmeplumbing.com',
      passwordHash,
      name: 'Carol Customer',
      role: 'CUSTOMER',
      companyId: acmePlumbing.id,
    },
  });

  // -------------------------------------------------------------------------
  // Users — Swift Electric
  // -------------------------------------------------------------------------
  const swiftAdmin = await prisma.user.create({
    data: {
      email: 'admin@swiftelectric.com',
      passwordHash,
      name: 'Sam Swift',
      role: 'ADMIN',
      companyId: swiftElectric.id,
    },
  });

  const swiftDispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@swiftelectric.com',
      passwordHash,
      name: 'Diana Dispatch',
      role: 'DISPATCHER',
      companyId: swiftElectric.id,
    },
  });

  const swiftTechUser = await prisma.user.create({
    data: {
      email: 'tech@swiftelectric.com',
      passwordHash,
      name: 'Tony Watts',
      role: 'TECHNICIAN',
      companyId: swiftElectric.id,
    },
  });

  const swiftCustomerUser = await prisma.user.create({
    data: {
      email: 'customer@swiftelectric.com',
      passwordHash,
      name: 'Claire Client',
      role: 'CUSTOMER',
      companyId: swiftElectric.id,
    },
  });

  // -------------------------------------------------------------------------
  // Technicians
  // -------------------------------------------------------------------------
  const acmeTech = await prisma.technician.create({
    data: {
      userId: acmeTechUser.id,
      specialties: ['residential plumbing', 'pipe repair', 'water heater'],
      isAvailable: true,
      rating: 4.8,
      companyId: acmePlumbing.id,
    },
  });

  const swiftTech = await prisma.technician.create({
    data: {
      userId: swiftTechUser.id,
      specialties: ['residential electrical', 'panel upgrades', 'EV chargers'],
      isAvailable: true,
      rating: 4.6,
      companyId: swiftElectric.id,
    },
  });

  // -------------------------------------------------------------------------
  // Customers
  // -------------------------------------------------------------------------
  const acmeCustomer1 = await prisma.customer.create({
    data: {
      name: 'Greenfield Apartments',
      email: 'manager@greenfieldapts.com',
      phone: '555-100-2000',
      address: '400 Elm Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      companyId: acmePlumbing.id,
    },
  });

  const acmeCustomer2 = await prisma.customer.create({
    data: {
      name: 'Riverdale Office Park',
      email: 'facilities@riverdaleoffice.com',
      phone: '555-200-3000',
      address: '88 Commerce Drive',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      companyId: acmePlumbing.id,
    },
  });

  const swiftCustomer1 = await prisma.customer.create({
    data: {
      name: 'Sunrise Homes LLC',
      email: 'info@sunrisehomes.com',
      phone: '555-300-4000',
      address: '1200 Oak Avenue',
      city: 'Decatur',
      state: 'IL',
      zipCode: '62521',
      companyId: swiftElectric.id,
    },
  });

  const swiftCustomer2 = await prisma.customer.create({
    data: {
      name: 'Metro Mall Management',
      email: 'ops@metromall.com',
      phone: '555-400-5000',
      address: '5500 Mall Boulevard',
      city: 'Decatur',
      state: 'IL',
      zipCode: '62526',
      companyId: swiftElectric.id,
    },
  });

  // -------------------------------------------------------------------------
  // Work Orders — Acme Plumbing
  // -------------------------------------------------------------------------
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(10, 0, 0, 0);

  const acmeWO1 = await prisma.workOrder.create({
    data: {
      title: 'Kitchen sink leak repair',
      description: 'Tenant in unit 4B reports a persistent leak under the kitchen sink.',
      status: 'ASSIGNED',
      priority: 'HIGH',
      scheduledDate: tomorrow,
      estimatedHours: 2.0,
      customerId: acmeCustomer1.id,
      technicianId: acmeTech.id,
      companyId: acmePlumbing.id,
    },
  });

  const acmeWO2 = await prisma.workOrder.create({
    data: {
      title: 'Water heater replacement',
      description: '50-gallon commercial water heater showing error codes. Needs full replacement.',
      status: 'UNASSIGNED',
      priority: 'URGENT',
      scheduledDate: dayAfter,
      estimatedHours: 4.0,
      customerId: acmeCustomer2.id,
      companyId: acmePlumbing.id,
    },
  });

  const acmeWO3 = await prisma.workOrder.create({
    data: {
      title: 'Bathroom fixture installation',
      description: 'Install new faucet and showerhead in lobby restroom.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      completedDate: new Date(),
      estimatedHours: 1.5,
      actualHours: 1.25,
      customerId: acmeCustomer2.id,
      technicianId: acmeTech.id,
      companyId: acmePlumbing.id,
    },
  });

  // -------------------------------------------------------------------------
  // Work Orders — Swift Electric
  // -------------------------------------------------------------------------
  const swiftWO1 = await prisma.workOrder.create({
    data: {
      title: 'Panel upgrade to 200A',
      description: 'Residential panel upgrade from 100A to 200A service.',
      status: 'ASSIGNED',
      priority: 'HIGH',
      scheduledDate: tomorrow,
      estimatedHours: 6.0,
      customerId: swiftCustomer1.id,
      technicianId: swiftTech.id,
      companyId: swiftElectric.id,
    },
  });

  const swiftWO2 = await prisma.workOrder.create({
    data: {
      title: 'EV charger installation',
      description: 'Install Level 2 charger in garage, 50A circuit from main panel.',
      status: 'UNASSIGNED',
      priority: 'MEDIUM',
      scheduledDate: dayAfter,
      estimatedHours: 3.0,
      customerId: swiftCustomer1.id,
      companyId: swiftElectric.id,
    },
  });

  const swiftWO3 = await prisma.workOrder.create({
    data: {
      title: 'Emergency lighting inspection',
      description: 'Annual inspection and battery testing of all emergency exit lights.',
      status: 'IN_PROGRESS',
      priority: 'LOW',
      scheduledDate: new Date(),
      estimatedHours: 2.0,
      customerId: swiftCustomer2.id,
      technicianId: swiftTech.id,
      companyId: swiftElectric.id,
    },
  });

  // -------------------------------------------------------------------------
  // Routes
  // -------------------------------------------------------------------------
  const acmeRoute = await prisma.route.create({
    data: {
      name: 'Tom Morning Route',
      date: tomorrow,
      technicianId: acmeTech.id,
      companyId: acmePlumbing.id,
      stops: {
        create: [
          {
            workOrderId: acmeWO1.id,
            sequenceOrder: 1,
            estimatedArrival: new Date(tomorrow.getTime()),
          },
          {
            workOrderId: acmeWO3.id,
            sequenceOrder: 2,
            estimatedArrival: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  const swiftRoute = await prisma.route.create({
    data: {
      name: 'Tony Full-Day Route',
      date: tomorrow,
      technicianId: swiftTech.id,
      companyId: swiftElectric.id,
      stops: {
        create: [
          {
            workOrderId: swiftWO1.id,
            sequenceOrder: 1,
            estimatedArrival: new Date(tomorrow.getTime()),
          },
          {
            workOrderId: swiftWO3.id,
            sequenceOrder: 2,
            estimatedArrival: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------------------
  // Invoices with Line Items
  // -------------------------------------------------------------------------
  const acmeInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'ACME-2026-001',
      workOrderId: acmeWO3.id,
      status: 'SENT',
      subtotal: 275.0,
      tax: 22.0,
      total: 297.0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      companyId: acmePlumbing.id,
      lineItems: {
        create: [
          {
            description: 'Labor — fixture installation (1.25 hrs)',
            quantity: 1.25,
            unitPrice: 120.0,
            total: 150.0,
          },
          {
            description: 'Moen Brantford faucet',
            quantity: 1,
            unitPrice: 89.0,
            total: 89.0,
          },
          {
            description: 'Waterpik showerhead',
            quantity: 1,
            unitPrice: 36.0,
            total: 36.0,
          },
        ],
      },
    },
  });

  const swiftInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'SWIFT-2026-001',
      workOrderId: swiftWO1.id,
      status: 'DRAFT',
      subtotal: 1850.0,
      tax: 148.0,
      total: 1998.0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      companyId: swiftElectric.id,
      lineItems: {
        create: [
          {
            description: 'Labor — panel upgrade (6 hrs)',
            quantity: 6,
            unitPrice: 150.0,
            total: 900.0,
          },
          {
            description: 'Square D 200A main breaker panel',
            quantity: 1,
            unitPrice: 650.0,
            total: 650.0,
          },
          {
            description: 'Permit and inspection fee',
            quantity: 1,
            unitPrice: 300.0,
            total: 300.0,
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------------------
  // Dashboards and Widgets
  // -------------------------------------------------------------------------
  const acmeDashboard = await prisma.dashboard.create({
    data: {
      name: 'Operations Overview',
      description: 'Daily dispatch and work order metrics',
      layout: { columns: 2, rows: 2 },
      companyId: acmePlumbing.id,
      createdBy: acmeAdmin.id,
      widgets: {
        create: [
          {
            type: 'bar_chart',
            title: 'Work Orders by Status',
            config: { metric: 'work_order_count', groupBy: 'status' },
            position: { x: 0, y: 0, w: 1, h: 1 },
          },
          {
            type: 'line_chart',
            title: 'Revenue This Month',
            config: { metric: 'invoice_total', period: 'monthly' },
            position: { x: 1, y: 0, w: 1, h: 1 },
          },
          {
            type: 'stat_card',
            title: 'Active Technicians',
            config: { metric: 'technician_available_count' },
            position: { x: 0, y: 1, w: 1, h: 1 },
          },
          {
            type: 'table',
            title: 'Overdue Invoices',
            config: { metric: 'overdue_invoices', limit: 10 },
            position: { x: 1, y: 1, w: 1, h: 1 },
          },
        ],
      },
    },
  });

  const swiftDashboard = await prisma.dashboard.create({
    data: {
      name: 'Dispatch Board',
      description: 'Technician scheduling and route tracking',
      layout: { columns: 3, rows: 1 },
      companyId: swiftElectric.id,
      createdBy: swiftAdmin.id,
      widgets: {
        create: [
          {
            type: 'map',
            title: 'Active Routes',
            config: { metric: 'route_locations', liveUpdate: true },
            position: { x: 0, y: 0, w: 2, h: 1 },
          },
          {
            type: 'pie_chart',
            title: 'Work Orders by Priority',
            config: { metric: 'work_order_count', groupBy: 'priority' },
            position: { x: 2, y: 0, w: 1, h: 1 },
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------------------
  // Data Sources
  // -------------------------------------------------------------------------
  await prisma.dataSource.create({
    data: {
      name: 'Acme QuickBooks',
      type: 'quickbooks',
      connectionConfig: {
        realmId: 'acme-qb-realm-001',
        apiUrl: 'https://sandbox-quickbooks.api.intuit.com',
      },
      isActive: true,
      lastSyncAt: new Date(),
      companyId: acmePlumbing.id,
    },
  });

  await prisma.dataSource.create({
    data: {
      name: 'Swift GPS Fleet Tracker',
      type: 'gps_tracker',
      connectionConfig: {
        provider: 'samsara',
        apiKey: 'encrypted:placeholder',
        fleetId: 'swift-fleet-001',
      },
      isActive: true,
      lastSyncAt: new Date(),
      companyId: swiftElectric.id,
    },
  });

  // -------------------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------------------
  await prisma.notification.create({
    data: {
      userId: acmeTechUser.id,
      type: 'WORK_ORDER_ASSIGNED',
      title: 'New Work Order Assigned',
      message: 'You have been assigned "Kitchen sink leak repair" for tomorrow.',
      isRead: false,
      companyId: acmePlumbing.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: swiftTechUser.id,
      type: 'ROUTE_UPDATED',
      title: 'Route Updated',
      message: 'Your route "Tony Full-Day Route" has been updated with new stops.',
      isRead: false,
      companyId: swiftElectric.id,
    },
  });

  // -------------------------------------------------------------------------
  // Audit Logs
  // -------------------------------------------------------------------------
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'WorkOrder',
      entityId: acmeWO1.id,
      userId: acmeDispatcher.id,
      changes: { title: 'Kitchen sink leak repair', status: 'ASSIGNED' },
      companyId: acmePlumbing.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      entityType: 'WorkOrder',
      entityId: acmeWO3.id,
      userId: acmeTechUser.id,
      changes: { status: { from: 'IN_PROGRESS', to: 'COMPLETED' } },
      companyId: acmePlumbing.id,
    },
  });

  console.log('Seed completed successfully.');
  console.log(`  Companies: 2`);
  console.log(`  Users: 8 (4 per company)`);
  console.log(`  Technicians: 2`);
  console.log(`  Customers: 4`);
  console.log(`  Work Orders: 6`);
  console.log(`  Routes: 2 (with stops)`);
  console.log(`  Invoices: 2 (with line items)`);
  console.log(`  Dashboards: 2 (with widgets)`);
  console.log(`  Data Sources: 2`);
  console.log(`  Notifications: 2`);
  console.log(`  Audit Logs: 2`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
