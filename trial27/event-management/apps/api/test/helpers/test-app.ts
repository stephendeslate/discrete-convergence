// TRACED: EM-INFRA-004 — Test app factory for integration tests
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-for-jest';

// In-memory stores for mock data
const users: Record<string, unknown>[] = [];
const tenants: Record<string, unknown>[] = [];
const events: Record<string, unknown>[] = [];
const venues: Record<string, unknown>[] = [];
const ticketTypes: Record<string, unknown>[] = [];
const registrations: Record<string, unknown>[] = [];
const auditLogs: Record<string, unknown>[] = [];

function resetStores() {
  users.length = 0;
  tenants.length = 0;
  events.length = 0;
  venues.length = 0;
  ticketTypes.length = 0;
  registrations.length = 0;
  auditLogs.length = 0;
}

function uuid() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

function makeModelMock<T extends Record<string, unknown>>(store: T[], findMatch: (item: T, where: Record<string, unknown>) => boolean) {
  return {
    findFirst: jest.fn(({ where, include }: Record<string, unknown> = {}) => {
      const item = store.find((i) => findMatch(i, where as Record<string, unknown>));
      return Promise.resolve(item || null);
    }),
    findUnique: jest.fn(({ where }: Record<string, unknown> = {}) => {
      const item = store.find((i) => findMatch(i, where as Record<string, unknown>));
      return Promise.resolve(item || null);
    }),
    findMany: jest.fn(({ where, skip, take, orderBy, include }: Record<string, unknown> = {}) => {
      let results = store.filter((i) => {
        if (!where) return true;
        return Object.keys(where as Record<string, unknown>).every((k) => i[k] === (where as Record<string, unknown>)[k]);
      });
      if (skip) results = results.slice(skip as number);
      if (take) results = results.slice(0, take as number);
      return Promise.resolve(results);
    }),
    create: jest.fn(({ data }: Record<string, unknown>) => {
      const item = { id: uuid(), ...data as Record<string, unknown>, createdAt: new Date(), updatedAt: new Date() } as unknown as T;
      store.push(item);
      return Promise.resolve(item);
    }),
    update: jest.fn(({ where, data }: Record<string, unknown>) => {
      const w = where as Record<string, unknown>;
      const idx = store.findIndex((i) => i.id === w.id);
      if (idx >= 0) {
        store[idx] = { ...store[idx], ...data as Record<string, unknown>, updatedAt: new Date() } as unknown as T;
        return Promise.resolve(store[idx]);
      }
      return Promise.resolve(null);
    }),
    delete: jest.fn(({ where }: Record<string, unknown>) => {
      const w = where as Record<string, unknown>;
      const idx = store.findIndex((i) => i.id === w.id);
      if (idx >= 0) {
        const [removed] = store.splice(idx, 1);
        return Promise.resolve(removed);
      }
      return Promise.resolve(null);
    }),
    count: jest.fn(({ where }: Record<string, unknown> = {}) => {
      if (!where) return Promise.resolve(store.length);
      const count = store.filter((i) => {
        return Object.keys(where as Record<string, unknown>).every((k) => i[k] === (where as Record<string, unknown>)[k]);
      }).length;
      return Promise.resolve(count);
    }),
  };
}

const mockUser = makeModelMock(users, (u, where) => {
  if (where.email && where.tenantId) return u.email === where.email && u.tenantId === where.tenantId;
  if (where.id) return u.id === where.id;
  if (where.email) return u.email === where.email;
  return false;
});

const mockTenant = makeModelMock(tenants, (t, where) => {
  if (where.id) return t.id === where.id;
  if (where.slug) return t.slug === where.slug;
  if (where.name) return t.name === where.name;
  return false;
});

const mockEvent = makeModelMock(events, (e, where) => {
  if (where.id && where.tenantId) return e.id === where.id && e.tenantId === where.tenantId;
  if (where.id) return e.id === where.id;
  if (where.tenantId) return e.tenantId === where.tenantId;
  return false;
});

// Override event create to add default status
mockEvent.create = jest.fn(({ data }: Record<string, unknown>) => {
  const d = data as Record<string, unknown>;
  const item = {
    id: uuid(),
    ...d,
    status: d.status || 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  events.push(item);
  return Promise.resolve(item);
});

const mockVenue = makeModelMock(venues, (v, where) => {
  if (where.id && where.tenantId) return v.id === where.id && v.tenantId === where.tenantId;
  if (where.id) return v.id === where.id;
  if (where.tenantId) return v.tenantId === where.tenantId;
  return false;
});

const mockTicketType = makeModelMock(ticketTypes, (tt, where) => {
  if (where.id) return tt.id === where.id;
  if (where.eventId) return tt.eventId === where.eventId;
  return false;
});

const mockRegistration = makeModelMock(registrations, (r, where) => {
  if (where.id) return r.id === where.id;
  if (where.eventId) return r.eventId === where.eventId;
  return false;
});

const mockAuditLog = makeModelMock(auditLogs, (al, where) => {
  if (where.id) return al.id === where.id;
  if (where.tenantId) return al.tenantId === where.tenantId;
  return false;
});

const mockPrismaService: Record<string, unknown> = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $executeRaw: jest.fn().mockResolvedValue(1),
  $transaction: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
  user: mockUser,
  tenant: mockTenant,
  event: mockEvent,
  venue: mockVenue,
  ticketType: mockTicketType,
  registration: mockRegistration,
  auditLog: mockAuditLog,
};

mockPrismaService.$transaction = jest.fn((fn: unknown): unknown => {
  if (typeof fn === 'function') return (fn as (prisma: typeof mockPrismaService) => unknown)(mockPrismaService);
  return Promise.all(fn as Promise<unknown>[]);
});

export async function createTestApp(): Promise<INestApplication> {
  resetStores();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrismaService)
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

export async function getAuthToken(app: INestApplication): Promise<string> {
  const server = app.getHttpServer();

  // Register a test user
  const registerRes = await request(server)
    .post('/auth/register')
    .send({
      email: `test-${Date.now()}@test.com`,
      password: 'password123',
      tenantId: 'test-tenant-id',
    });

  if (registerRes.status === 201 || registerRes.status === 200) {
    return registerRes.body.accessToken;
  }

  throw new Error(`Failed to get auth token: ${registerRes.status}`);
}
