import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

const prisma = new PrismaClient();

async function main() {
  // Organizations
  const org1 = await prisma.organization.create({
    data: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'TechConf Inc',
      slug: 'techconf-inc',
      tier: 'PRO',
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      name: 'Community Events Co',
      slug: 'community-events-co',
      tier: 'FREE',
    },
  });

  // Users
  const hashedPassword = await bcrypt.hash('Password123!', BCRYPT_SALT_ROUNDS);

  const user1 = await prisma.user.create({
    data: {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      email: 'admin@techconf.io',
      password: hashedPassword,
      name: 'Alice Chen',
      role: 'ADMIN',
      organizationId: org1.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
      email: 'organizer@techconf.io',
      password: hashedPassword,
      name: 'Bob Martinez',
      role: 'ORGANIZER',
      organizationId: org1.id,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
      email: 'attendee@techconf.io',
      password: hashedPassword,
      name: 'Carol Singh',
      role: 'ATTENDEE',
      organizationId: org1.id,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
      email: 'admin@community-events.org',
      password: hashedPassword,
      name: 'David Kim',
      role: 'ADMIN',
      organizationId: org2.id,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      id: '07b8c9d0-e1f2-3456-0123-567890123456',
      email: 'organizer@community-events.org',
      password: hashedPassword,
      name: 'Eva Torres',
      role: 'ORGANIZER',
      organizationId: org2.id,
    },
  });

  // Events
  const event1 = await prisma.event.create({
    data: {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'TechConf 2026',
      description: 'Annual technology conference featuring keynotes, workshops, and networking.',
      slug: 'techconf-2026',
      startDate: new Date('2026-06-15T09:00:00Z'),
      endDate: new Date('2026-06-17T18:00:00Z'),
      status: 'REGISTRATION_OPEN',
      organizationId: org1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Cloud Architecture Workshop',
      description: 'Hands-on workshop covering modern cloud architecture patterns.',
      slug: 'cloud-workshop-2026',
      startDate: new Date('2026-07-10T10:00:00Z'),
      endDate: new Date('2026-07-10T17:00:00Z'),
      status: 'DRAFT',
      organizationId: org1.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      id: '10000000-0000-0000-0000-000000000003',
      name: 'Community JavaScript Meetup',
      description: 'Monthly meetup for JavaScript enthusiasts.',
      slug: 'js-meetup-mar-2026',
      startDate: new Date('2026-03-28T18:30:00Z'),
      endDate: new Date('2026-03-28T21:00:00Z'),
      status: 'COMPLETED',
      organizationId: org2.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      id: '10000000-0000-0000-0000-000000000004',
      name: 'Spring Hackathon 2026',
      description: '48-hour hackathon with prizes for best projects.',
      slug: 'spring-hackathon-2026',
      startDate: new Date('2026-04-19T09:00:00Z'),
      endDate: new Date('2026-04-21T17:00:00Z'),
      status: 'PUBLISHED',
      organizationId: org2.id,
    },
  });

  // Venues
  const venue1 = await prisma.venue.create({
    data: {
      id: '20000000-0000-0000-0000-000000000001',
      name: 'Downtown Convention Center',
      address: '100 Main Street, San Francisco, CA 94105',
      capacity: 2000,
      organizationId: org1.id,
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      id: '20000000-0000-0000-0000-000000000002',
      name: 'Innovation Hub Room A',
      address: '250 Tech Boulevard, San Francisco, CA 94107',
      capacity: 50,
      organizationId: org1.id,
    },
  });

  const venue3 = await prisma.venue.create({
    data: {
      id: '20000000-0000-0000-0000-000000000003',
      name: 'Community Center Hall',
      address: '45 Oak Avenue, Portland, OR 97201',
      capacity: 300,
      organizationId: org2.id,
    },
  });

  // Ticket Types
  const ticketGeneral = await prisma.ticketType.create({
    data: {
      id: '30000000-0000-0000-0000-000000000001',
      name: 'General Admission',
      price: 149.99,
      quota: 500,
      eventId: event1.id,
    },
  });

  const ticketVip = await prisma.ticketType.create({
    data: {
      id: '30000000-0000-0000-0000-000000000002',
      name: 'VIP Pass',
      price: 499.99,
      quota: 50,
      eventId: event1.id,
    },
  });

  const ticketEarlyBird = await prisma.ticketType.create({
    data: {
      id: '30000000-0000-0000-0000-000000000003',
      name: 'Early Bird',
      price: 99.99,
      quota: 200,
      eventId: event4.id,
    },
  });

  const ticketStudent = await prisma.ticketType.create({
    data: {
      id: '30000000-0000-0000-0000-000000000004',
      name: 'Student',
      price: 0.0,
      quota: 100,
      eventId: event3.id,
    },
  });

  // Registrations
  const reg1 = await prisma.registration.create({
    data: {
      id: '40000000-0000-0000-0000-000000000001',
      attendeeName: 'Carol Singh',
      attendeeEmail: 'attendee@techconf.io',
      status: 'CONFIRMED',
      eventId: event1.id,
      ticketTypeId: ticketGeneral.id,
      organizationId: org1.id,
    },
  });

  const reg2 = await prisma.registration.create({
    data: {
      id: '40000000-0000-0000-0000-000000000002',
      attendeeName: 'Frank Lee',
      attendeeEmail: 'frank.lee@example.com',
      status: 'CONFIRMED',
      eventId: event1.id,
      ticketTypeId: ticketVip.id,
      organizationId: org1.id,
    },
  });

  const reg3 = await prisma.registration.create({
    data: {
      id: '40000000-0000-0000-0000-000000000003',
      attendeeName: 'Grace Hopper',
      attendeeEmail: 'grace@example.com',
      status: 'CHECKED_IN',
      eventId: event3.id,
      ticketTypeId: ticketStudent.id,
      organizationId: org2.id,
    },
  });

  const reg4 = await prisma.registration.create({
    data: {
      id: '40000000-0000-0000-0000-000000000004',
      attendeeName: 'Hank Patel',
      attendeeEmail: 'hank.patel@example.com',
      status: 'CANCELLED',
      eventId: event1.id,
      ticketTypeId: ticketGeneral.id,
      organizationId: org1.id,
    },
  });

  const reg5 = await prisma.registration.create({
    data: {
      id: '40000000-0000-0000-0000-000000000005',
      attendeeName: 'Irene Wu',
      attendeeEmail: 'irene.wu@example.com',
      status: 'PENDING',
      eventId: event4.id,
      ticketTypeId: ticketEarlyBird.id,
      organizationId: org2.id,
    },
  });

  const reg6 = await prisma.registration.create({
    data: {
      id: '40000000-0000-0000-0000-000000000006',
      attendeeName: 'Jake Rivera',
      attendeeEmail: 'jake.r@example.com',
      status: 'CONFIRMED',
      eventId: event4.id,
      ticketTypeId: ticketEarlyBird.id,
      organizationId: org2.id,
    },
  });

  // Check-ins
  await prisma.checkIn.create({
    data: {
      id: '50000000-0000-0000-0000-000000000001',
      registrationId: reg3.id,
      checkedInAt: new Date('2026-03-28T18:45:00Z'),
    },
  });

  await prisma.checkIn.create({
    data: {
      id: '50000000-0000-0000-0000-000000000002',
      registrationId: reg2.id,
      checkedInAt: new Date('2026-06-15T08:30:00Z'),
    },
  });

  // Data Sources
  const ds1 = await prisma.dataSource.create({
    data: {
      id: '60000000-0000-0000-0000-000000000001',
      name: 'Primary PostgreSQL',
      type: 'POSTGRES',
      config: { host: 'db.techconf.io', port: 5432, database: 'events_prod' },
      status: 'active',
      lastSyncAt: new Date('2026-03-25T02:00:00Z'),
      organizationId: org1.id,
    },
  });

  const ds2 = await prisma.dataSource.create({
    data: {
      id: '60000000-0000-0000-0000-000000000002',
      name: 'Registration Webhook',
      type: 'WEBHOOK',
      config: { endpoint: '/api/webhooks/registrations', secret: 'whsec_example' },
      status: 'active',
      lastSyncAt: new Date('2026-03-24T15:30:00Z'),
      organizationId: org1.id,
    },
  });

  const ds3 = await prisma.dataSource.create({
    data: {
      id: '60000000-0000-0000-0000-000000000003',
      name: 'Attendee CSV Import',
      type: 'CSV',
      config: { delimiter: ',', hasHeader: true },
      status: 'inactive',
      organizationId: org2.id,
    },
  });

  // Dashboards
  const dashboard1 = await prisma.dashboard.create({
    data: {
      id: '70000000-0000-0000-0000-000000000001',
      name: 'TechConf 2026 Overview',
      description: 'Real-time registration and attendance metrics for TechConf 2026.',
      status: 'PUBLISHED',
      organizationId: org1.id,
    },
  });

  const dashboard2 = await prisma.dashboard.create({
    data: {
      id: '70000000-0000-0000-0000-000000000002',
      name: 'Community Events Summary',
      description: 'Aggregate view of all community events and engagement.',
      status: 'DRAFT',
      organizationId: org2.id,
    },
  });

  // Widgets
  await prisma.widget.create({
    data: {
      id: '80000000-0000-0000-0000-000000000001',
      name: 'Registration Trends',
      type: 'LINE_CHART',
      config: { metric: 'registrations', groupBy: 'day', period: '30d' },
      dashboardId: dashboard1.id,
    },
  });

  await prisma.widget.create({
    data: {
      id: '80000000-0000-0000-0000-000000000002',
      name: 'Ticket Breakdown',
      type: 'PIE_CHART',
      config: { metric: 'ticket_types', showPercentages: true },
      dashboardId: dashboard1.id,
    },
  });

  await prisma.widget.create({
    data: {
      id: '80000000-0000-0000-0000-000000000003',
      name: 'Total Attendees',
      type: 'STAT_CARD',
      config: { metric: 'total_attendees', compareWith: 'previous_event' },
      dashboardId: dashboard2.id,
    },
  });

  // Sync History
  await prisma.syncHistory.create({
    data: {
      id: '90000000-0000-0000-0000-000000000001',
      dataSourceId: ds1.id,
      status: 'SUCCESS',
      recordsProcessed: 1250,
      createdAt: new Date('2026-03-25T02:00:00Z'),
    },
  });

  await prisma.syncHistory.create({
    data: {
      id: '90000000-0000-0000-0000-000000000002',
      dataSourceId: ds1.id,
      status: 'SUCCESS',
      recordsProcessed: 1248,
      createdAt: new Date('2026-03-24T02:00:00Z'),
    },
  });

  await prisma.syncHistory.create({
    data: {
      id: '90000000-0000-0000-0000-000000000003',
      dataSourceId: ds2.id,
      status: 'SUCCESS',
      recordsProcessed: 37,
      createdAt: new Date('2026-03-24T15:30:00Z'),
    },
  });

  await prisma.syncHistory.create({
    data: {
      id: '90000000-0000-0000-0000-000000000004',
      dataSourceId: ds3.id,
      status: 'FAILED',
      errorMessage: 'CSV parsing error: unexpected delimiter at row 142, column 3',
      recordsProcessed: 141,
      createdAt: new Date('2026-03-20T10:15:00Z'),
    },
  });

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000001',
      action: 'CREATE',
      entityType: 'Event',
      entityId: event1.id,
      metadata: { eventName: 'TechConf 2026' },
      userId: user1.id,
      organizationId: org1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000002',
      action: 'UPDATE',
      entityType: 'Event',
      entityId: event1.id,
      metadata: { field: 'status', from: 'DRAFT', to: 'REGISTRATION_OPEN' },
      userId: user2.id,
      organizationId: org1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000003',
      action: 'CREATE',
      entityType: 'Registration',
      entityId: reg1.id,
      metadata: { attendeeEmail: 'attendee@techconf.io', ticketType: 'General Admission' },
      userId: user3.id,
      organizationId: org1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000004',
      action: 'DELETE',
      entityType: 'Registration',
      entityId: reg4.id,
      metadata: { reason: 'User requested cancellation' },
      userId: user1.id,
      organizationId: org1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000005',
      action: 'CREATE',
      entityType: 'Event',
      entityId: event4.id,
      metadata: { eventName: 'Spring Hackathon 2026' },
      userId: user4.id,
      organizationId: org2.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000006',
      action: 'CREATE',
      entityType: 'Dashboard',
      entityId: dashboard1.id,
      metadata: { dashboardName: 'TechConf 2026 Overview' },
      userId: user2.id,
      organizationId: org1.id,
    },
  });
}

main()
  .catch((e) => {
    process.stderr.write(String(e) + '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
