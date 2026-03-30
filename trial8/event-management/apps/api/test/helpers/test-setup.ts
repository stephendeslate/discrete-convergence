import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infra/prisma.service';
import { ThrottlerGuard, getOptionsToken } from '@nestjs/throttler';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';

// TRACED: EM-TEST-001 — Shared test utilities for integration tests

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  adminToken: string;
  userToken: string;
  organizerToken: string;
  tenantId: string;
}

const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000099';

// Set required env vars for tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const mockPrismaService = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $executeRaw: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
  user: {
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  event: {
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  venue: {
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  ticket: {
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  attendee: {
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  schedule: {
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
};

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrismaService)
    .overrideProvider(getOptionsToken())
    .useValue([
      { name: 'default', ttl: 60000, limit: 10000 },
      { name: 'auth', ttl: 60000, limit: 10000 },
    ])
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

export function getMockPrisma() {
  return mockPrismaService;
}

export async function setupTestContext(): Promise<TestContext> {
  const app = await createTestApp();
  const jwtService = app.get(JwtService);
  const tenantId = TEST_TENANT_ID;

  // Generate tokens directly instead of going through DB
  const adminToken = jwtService.sign({
    sub: 'admin-test-id',
    email: 'admin@test.com',
    role: 'ADMIN',
    tenantId,
  });

  const organizerToken = jwtService.sign({
    sub: 'organizer-test-id',
    email: 'organizer@test.com',
    role: 'ORGANIZER',
    tenantId,
  });

  const userToken = jwtService.sign({
    sub: 'user-test-id',
    email: 'user@test.com',
    role: 'USER',
    tenantId,
  });

  // Mock user lookups for JWT validation
  mockPrismaService.user.findFirst.mockImplementation(({ where }: any) => {
    if (where?.id === 'admin-test-id') {
      return Promise.resolve({ id: 'admin-test-id', email: 'admin@test.com', role: 'ADMIN', tenantId });
    }
    if (where?.id === 'organizer-test-id') {
      return Promise.resolve({ id: 'organizer-test-id', email: 'organizer@test.com', role: 'ORGANIZER', tenantId });
    }
    if (where?.id === 'user-test-id') {
      return Promise.resolve({ id: 'user-test-id', email: 'user@test.com', role: 'USER', tenantId });
    }
    return Promise.resolve(null);
  });

  return {
    app,
    prisma: mockPrismaService as any,
    adminToken,
    userToken,
    organizerToken,
    tenantId,
  };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function cleanupTestContext(ctx: TestContext) {
  // Reset all mocks
  jest.clearAllMocks();
  await ctx.app.close();
}

export { TEST_TENANT_ID };
