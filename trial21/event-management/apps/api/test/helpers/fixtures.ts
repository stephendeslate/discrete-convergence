/** Centralized test fixtures — TRACED:EM-TST-002 */

export const TEST_ORG = {
  id: 'org-test-001',
  name: 'Test Organization',
  tier: 'FREE',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const TEST_USER_ADMIN = {
  id: 'user-admin-001',
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN' as const,
  organizationId: TEST_ORG.id,
  passwordHash: '$2a$12$fakehash',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const TEST_USER_ATTENDEE = {
  id: 'user-attendee-001',
  email: 'attendee@test.com',
  firstName: 'Test',
  lastName: 'Attendee',
  role: 'ATTENDEE' as const,
  organizationId: TEST_ORG.id,
  passwordHash: '$2a$12$fakehash',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const TEST_EVENT_DRAFT = {
  id: 'event-draft-001',
  title: 'Draft Conference',
  slug: 'draft-conference',
  description: 'A draft conference',
  status: 'DRAFT' as const,
  timezone: 'America/New_York',
  startDate: new Date('2025-07-01T09:00:00Z'),
  endDate: new Date('2025-07-01T17:00:00Z'),
  organizationId: TEST_ORG.id,
  venueId: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const TEST_EVENT_OPEN = {
  ...TEST_EVENT_DRAFT,
  id: 'event-open-001',
  title: 'Open Conference',
  slug: 'open-conference',
  status: 'REGISTRATION_OPEN' as const,
};

export const TEST_EVENT_PAST = {
  ...TEST_EVENT_DRAFT,
  id: 'event-past-001',
  title: 'Past Conference',
  slug: 'past-conference',
  status: 'COMPLETED' as const,
  startDate: new Date('2024-01-01T09:00:00Z'),
  endDate: new Date('2024-01-01T17:00:00Z'),
};

export const TEST_VENUE = {
  id: 'venue-001',
  name: 'Conference Hall A',
  address: '123 Event Street',
  capacity: 500,
  organizationId: TEST_ORG.id,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const TEST_TICKET_TYPE = {
  id: 'ticket-001',
  name: 'General Admission',
  price: 2500,
  quota: 200,
  eventId: TEST_EVENT_OPEN.id,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const TEST_REGISTRATION = {
  id: 'reg-001',
  status: 'CONFIRMED' as const,
  userId: TEST_USER_ATTENDEE.id,
  eventId: TEST_EVENT_OPEN.id,
  ticketTypeId: TEST_TICKET_TYPE.id,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
