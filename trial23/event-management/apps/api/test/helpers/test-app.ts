process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://testuser:testpass@localhost:5433/testdb';
process.env.JWT_SECRET = 'test-jwt-secret-for-integration';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infra/prisma.service';

/** Builds a deep mock for PrismaService with sensible defaults. */
export function buildMockPrismaService() {
  const mockUser = {
    id: 'user-uuid-001',
    email: 'test@example.com',
    passwordHash: '$2a$12$LJ3m4ys4Gz3HiR8xKPYOZOGPFgL4y1b4FqNfJk9XkVmYxHcW3iLLi', // bcrypt of 'StrongPass123!'
    name: 'Test User',
    role: 'ORGANIZER',
    organizationId: 'org-uuid-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrganization = {
    id: 'org-uuid-001',
    name: 'Default',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvent = {
    id: 'event-uuid-001',
    name: 'Test Event',
    description: 'A test event',
    startDate: new Date('2026-06-01T10:00:00.000Z'),
    endDate: new Date('2026-06-01T18:00:00.000Z'),
    status: 'DRAFT',
    venueId: null,
    organizationId: 'org-uuid-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVenue = {
    id: 'venue-uuid-001',
    name: 'Test Venue',
    address: '123 Main St',
    capacity: 500,
    organizationId: 'org-uuid-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRegistration = {
    id: 'reg-uuid-001',
    eventId: 'event-uuid-001',
    ticketTypeId: 'ticket-uuid-001',
    attendeeName: 'Jane Doe',
    attendeeEmail: 'jane@example.com',
    status: 'PENDING',
    organizationId: 'org-uuid-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDashboard = {
    id: 'dash-uuid-001',
    name: 'Test Dashboard',
    description: 'A test dashboard',
    status: 'DRAFT',
    organizationId: 'org-uuid-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDataSource = {
    id: 'ds-uuid-001',
    name: 'Test DataSource',
    type: 'POSTGRESQL',
    config: { host: 'localhost', port: 5432 },
    status: 'ACTIVE',
    lastSyncAt: null,
    organizationId: 'org-uuid-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSyncHistory = {
    id: 'sync-uuid-001',
    dataSourceId: 'ds-uuid-001',
    status: 'SUCCESS',
    startedAt: new Date(),
    completedAt: new Date(),
    organizationId: 'org-uuid-001',
  };

  const prisma = {
    user: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockUser, ...args.data, id: 'user-uuid-' + Date.now() }),
      ),
      findMany: jest.fn().mockResolvedValue([mockUser]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockUser, ...args.data }),
      ),
      delete: jest.fn().mockResolvedValue(mockUser),
    },
    organization: {
      findFirst: jest.fn().mockResolvedValue(mockOrganization),
      create: jest.fn().mockResolvedValue(mockOrganization),
    },
    event: {
      findFirst: jest.fn().mockResolvedValue(mockEvent),
      findUnique: jest.fn().mockResolvedValue(mockEvent),
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockEvent, ...args.data, id: 'event-uuid-' + Date.now() }),
      ),
      findMany: jest.fn().mockResolvedValue([mockEvent]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockEvent, ...args.data }),
      ),
      delete: jest.fn().mockResolvedValue(mockEvent),
    },
    venue: {
      findFirst: jest.fn().mockResolvedValue(mockVenue),
      findUnique: jest.fn().mockResolvedValue(mockVenue),
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockVenue, ...args.data, id: 'venue-uuid-' + Date.now() }),
      ),
      findMany: jest.fn().mockResolvedValue([mockVenue]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockVenue, ...args.data }),
      ),
      delete: jest.fn().mockResolvedValue(mockVenue),
    },
    registration: {
      findFirst: jest.fn().mockResolvedValue(mockRegistration),
      findUnique: jest.fn().mockResolvedValue(mockRegistration),
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockRegistration, ...args.data, id: 'reg-uuid-' + Date.now() }),
      ),
      findMany: jest.fn().mockResolvedValue([mockRegistration]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockRegistration, ...args.data }),
      ),
      delete: jest.fn().mockResolvedValue(mockRegistration),
    },
    dashboard: {
      findFirst: jest.fn().mockResolvedValue(mockDashboard),
      findUnique: jest.fn().mockResolvedValue(mockDashboard),
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockDashboard, ...args.data, id: 'dash-uuid-' + Date.now() }),
      ),
      findMany: jest.fn().mockResolvedValue([mockDashboard]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockDashboard, ...args.data }),
      ),
      delete: jest.fn().mockResolvedValue(mockDashboard),
    },
    dataSource: {
      findFirst: jest.fn().mockResolvedValue(mockDataSource),
      findUnique: jest.fn().mockResolvedValue(mockDataSource),
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockDataSource, ...args.data, id: 'ds-uuid-' + Date.now() }),
      ),
      findMany: jest.fn().mockResolvedValue([mockDataSource]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockDataSource, ...args.data }),
      ),
      delete: jest.fn().mockResolvedValue(mockDataSource),
    },
    syncHistory: {
      findFirst: jest.fn().mockResolvedValue(mockSyncHistory),
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...mockSyncHistory, ...args.data, id: 'sync-uuid-' + Date.now() }),
      ),
      findMany: jest.fn().mockResolvedValue([mockSyncHistory]),
      count: jest.fn().mockResolvedValue(1),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $executeRaw: jest.fn().mockResolvedValue(undefined),
    onModuleInit: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  };

  return {
    prisma,
    mockUser,
    mockOrganization,
    mockEvent,
    mockVenue,
    mockRegistration,
    mockDashboard,
    mockDataSource,
    mockSyncHistory,
  };
}

export const mockPrismaService = buildMockPrismaService().prisma;

export async function createTestApp(): Promise<{ app: INestApplication; module: TestingModule; prisma: ReturnType<typeof buildMockPrismaService>['prisma'] }> {
  const mocks = buildMockPrismaService();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mocks.prisma)
    .compile();

  const app = moduleRef.createNestApplication();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, module: moduleRef, prisma: mocks.prisma };
}

/** Generate a JWT for testing authenticated routes. */
export function generateTestToken(
  app: INestApplication,
  payload?: Partial<{ sub: string; email: string; role: string; organizationId: string }>,
): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET ?? 'test-jwt-secret-for-integration';
  return jwt.sign(
    {
      sub: payload?.sub ?? 'user-uuid-001',
      email: payload?.email ?? 'test@example.com',
      role: payload?.role ?? 'ORGANIZER',
      organizationId: payload?.organizationId ?? 'org-uuid-001',
    },
    secret,
    { expiresIn: '15m' },
  );
}

let emailCounter = 0;
export function uniqueEmail(): string {
  emailCounter += 1;
  return `test-${Date.now()}-${emailCounter}@example.com`;
}
