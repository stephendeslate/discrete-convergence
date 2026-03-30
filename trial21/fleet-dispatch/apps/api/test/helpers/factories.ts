import { randomUUID } from 'crypto';

const TENANT_ID = 'test-tenant-001';
const COMPANY_ID = 'test-company-001';

export function createTestUser(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    email: `user-${randomUUID().slice(0, 8)}@test.com`,
    passwordHash: '$2a$12$mockhashmockhashmockhashmo',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestCompany(overrides: Record<string, unknown> = {}) {
  return {
    id: COMPANY_ID,
    name: 'Test Company',
    address: '123 Test St',
    phone: '555-0100',
    email: 'test@company.com',
    woSequence: 0,
    invSequence: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestWorkOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    sequenceNumber: 'WO-00001',
    title: 'Fix HVAC Unit',
    description: 'Annual maintenance',
    status: 'UNASSIGNED' as const,
    priority: 3,
    scheduledDate: new Date(),
    completedDate: null,
    latitude: null,
    longitude: null,
    trackingToken: randomUUID(),
    tokenExpiry: new Date(Date.now() + 86400000),
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
    technicianId: null,
    customerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestTechnician(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    firstName: 'John',
    lastName: 'Tech',
    email: `tech-${randomUUID().slice(0, 8)}@test.com`,
    phone: '555-0200',
    skills: ['HVAC', 'Plumbing'],
    latitude: null,
    longitude: null,
    gpsUpdatedAt: null,
    isActive: true,
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    name: 'Test Customer',
    email: 'customer@test.com',
    phone: '555-0300',
    address: '456 Customer Ave',
    latitude: null,
    longitude: null,
    magicToken: null,
    tokenExpiry: null,
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    sequenceNumber: 'INV-00001',
    workOrderId: randomUUID(),
    status: 'DRAFT' as const,
    subtotal: 100,
    tax: 10,
    total: 110,
    sentAt: null,
    paidAt: null,
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestRoute(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    date: new Date(),
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
    optimizedAt: null,
    totalDistance: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createJwtPayload(overrides: Record<string, unknown> = {}) {
  return {
    sub: randomUUID(),
    email: 'admin@test.com',
    role: 'ADMIN',
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
    ...overrides,
  };
}

export { TENANT_ID, COMPANY_ID };
