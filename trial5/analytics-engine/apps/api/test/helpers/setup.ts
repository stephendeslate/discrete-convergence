// TRACED:AE-TEST-001 — Test DB setup with Prisma migration and cleanup
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5433/analytics_test',
    },
  },
});

export async function setupTestDb(): Promise<PrismaClient> {
  return prisma;
}

export async function cleanupTestDb(): Promise<void> {
  // Delete in order respecting foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.syncRun.deleteMany();
  await prisma.widget.deleteMany();
  await prisma.dashboard.deleteMany();
  await prisma.dataSource.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
}

export async function teardownTestDb(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma };

export const TEST_TENANT_ID = 'test-tenant-001';

export function createMockPrismaService() {
  return {
    dashboard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    dataSource: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    widget: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };
}

export function createTestDashboard(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dash-1',
    title: 'Test Dashboard',
    description: 'A test dashboard',
    status: 'DRAFT',
    tenantId: TEST_TENANT_ID,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createTestDataSource(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ds-1',
    name: 'Test DataSource',
    type: 'POSTGRES',
    config: {},
    tenantId: TEST_TENANT_ID,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createTestWidget(overrides: Record<string, unknown> = {}) {
  return {
    id: 'widget-1',
    title: 'Test Widget',
    type: 'LINE',
    config: {},
    dashboardId: 'dash-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}
