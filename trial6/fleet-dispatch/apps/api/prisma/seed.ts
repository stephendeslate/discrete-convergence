// TRACED:FD-INF-002 — database seed with error handling and shared imports
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Logistics',
      tier: 'PRO',
      settings: { maxVehicles: 50, maxDrivers: 25 },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'dispatcher@acme.com',
      passwordHash,
      name: 'Jane Dispatcher',
      role: 'DISPATCHER',
      tenantId: tenant.id,
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      licensePlate: 'FL-1234',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      status: 'AVAILABLE',
      latitude: 40.7128,
      longitude: -74.006,
      mileage: 15000,
      tenantId: tenant.id,
    },
  });

  // Maintenance vehicle — error/failure state data
  await prisma.vehicle.create({
    data: {
      licensePlate: 'FL-0001',
      make: 'Chevrolet',
      model: 'Express',
      year: 2020,
      status: 'MAINTENANCE',
      mileage: 95000,
      tenantId: tenant.id,
    },
  });

  const driver = await prisma.driver.create({
    data: {
      name: 'John Driver',
      licenseNumber: 'DL-98765',
      phone: '+1-555-0100',
      available: true,
      vehicleId: vehicle.id,
      tenantId: tenant.id,
    },
  });

  const route = await prisma.route.create({
    data: {
      name: 'Downtown Express',
      origin: '123 Main St, New York, NY',
      destination: '456 Broadway, New York, NY',
      waypoints: [{ lat: 40.72, lng: -73.99 }],
      distanceKm: 5.2,
      estimatedMinutes: 15,
      tenantId: tenant.id,
    },
  });

  await prisma.delivery.create({
    data: {
      trackingCode: 'DEL-001',
      status: 'IN_TRANSIT',
      recipientName: 'Alice Smith',
      address: '789 Park Ave, New York, NY',
      cost: 29.99,
      vehicleId: vehicle.id,
      driverId: driver.id,
      routeId: route.id,
      tenantId: tenant.id,
      scheduledAt: new Date(),
    },
  });

  // Failed delivery — error/failure state data
  await prisma.delivery.create({
    data: {
      trackingCode: 'DEL-FAIL-001',
      status: 'FAILED',
      recipientName: 'Bob Jones',
      address: '101 Oak St, New York, NY',
      notes: 'Recipient not available, access denied',
      cost: 15.5,
      tenantId: tenant.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'SEED',
      entity: 'system',
      entityId: tenant.id,
      details: { message: 'Database seeded successfully' },
      userId: admin.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error('Seed failed:', message);
    await prisma.$disconnect();
    process.exit(1);
  });
