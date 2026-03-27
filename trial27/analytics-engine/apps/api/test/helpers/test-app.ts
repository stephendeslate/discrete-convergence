import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infra/prisma.service';

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-for-jest';

// In-memory stores for mock data
const users: Record<string, unknown>[] = [];
const tenants: Record<string, unknown>[] = [];
const dashboards: Record<string, unknown>[] = [];
const widgets: Record<string, unknown>[] = [];
const dataSources: Record<string, unknown>[] = [];
const syncRuns: Record<string, unknown>[] = [];
const auditLogs: Record<string, unknown>[] = [];

function resetStores() {
  users.length = 0;
  tenants.length = 0;
  dashboards.length = 0;
  widgets.length = 0;
  dataSources.length = 0;
  syncRuns.length = 0;
  auditLogs.length = 0;
}

function uuid() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

function makeModelMock<T extends Record<string, unknown>>(store: T[], findMatch: (item: T, where: Record<string, unknown>) => boolean) {
  return {
    findFirst: jest.fn(({ where, include: _include }: Record<string, unknown> = {}) => {
      const item = store.find((i) => findMatch(i, where as Record<string, unknown>));
      return Promise.resolve(item || null);
    }),
    findUnique: jest.fn(({ where }: Record<string, unknown> = {}) => {
      const item = store.find((i) => findMatch(i, where as Record<string, unknown>));
      return Promise.resolve(item || null);
    }),
    findMany: jest.fn(({ where, skip, take, orderBy: _orderBy }: Record<string, unknown> = {}) => {
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

const mockTenant = makeModelMock(tenants, (t, where) => {
  if (where.id) return t.id === where.id;
  if (where.name) return t.name === where.name;
  return false;
});

const mockUser = makeModelMock(users, (u, where) => {
  if (where.id) return u.id === where.id;
  if (where.email) return u.email === where.email;
  return false;
});

const mockDashboard = makeModelMock(dashboards, (d, where) => {
  if (where.id && where.tenantId) return d.id === where.id && d.tenantId === where.tenantId;
  if (where.id) return d.id === where.id;
  if (where.tenantId && where.name) return d.tenantId === where.tenantId && d.name === where.name;
  if (where.tenantId) return d.tenantId === where.tenantId;
  return false;
});

// Override dashboard create to add default status
mockDashboard.create = jest.fn(({ data }: Record<string, unknown>) => {
  const d = data as Record<string, unknown>;
  const item = {
    id: uuid(),
    ...d,
    status: d.status || 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dashboards.push(item);
  return Promise.resolve(item);
});

const mockWidget = makeModelMock(widgets, (w, where) => {
  if (where.id && where.dashboard) {
    const dWhere = where.dashboard as Record<string, unknown>;
    const dash = dashboards.find((d) => d.id === w.dashboardId && d.tenantId === dWhere.tenantId);
    return w.id === where.id && !!dash;
  }
  if (where.id) return w.id === where.id;
  if (where.dashboardId) return w.dashboardId === where.dashboardId;
  return false;
});

const mockDataSource = makeModelMock(dataSources, (ds, where) => {
  if (where.id && where.tenantId) return ds.id === where.id && ds.tenantId === where.tenantId;
  if (where.id) return ds.id === where.id;
  if (where.tenantId && where.name) return ds.tenantId === where.tenantId && ds.name === where.name;
  if (where.tenantId) return ds.tenantId === where.tenantId;
  return false;
});

// Override dataSource create to add default status
mockDataSource.create = jest.fn(({ data }: Record<string, unknown>) => {
  const d = data as Record<string, unknown>;
  const item = {
    id: uuid(),
    ...d,
    status: d.status || 'ACTIVE',
    consecutiveFailures: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dataSources.push(item);
  return Promise.resolve(item);
});

const mockSyncRun = makeModelMock(syncRuns, (sr, where) => {
  if (where.id) return sr.id === where.id;
  if (where.dataSourceId) return sr.dataSourceId === where.dataSourceId;
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
  setTenantContext: jest.fn(),
  tenant: mockTenant,
  user: mockUser,
  dashboard: mockDashboard,
  widget: mockWidget,
  dataSource: mockDataSource,
  syncRun: mockSyncRun,
  auditLog: mockAuditLog,
};

mockPrismaService.$transaction = jest.fn((fn: unknown): unknown => {
  if (typeof fn === 'function') return (fn as (prisma: typeof mockPrismaService) => unknown)(mockPrismaService);
  return Promise.all(fn as Promise<unknown>[]);
});

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: typeof mockPrismaService;
}> {
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

  return { app, prisma: mockPrismaService };
}

export async function getAuthToken(
  app: INestApplication,
  request: (app: INestApplication) => import('supertest').Agent,
): Promise<string> {
  const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`;

  const registerRes = await request(app)
    .post('/auth/register')
    .send({
      email: uniqueEmail,
      password: 'password123',
      name: 'Test User',
      tenantName: 'Test Tenant',
    });

  return registerRes.body.accessToken;
}
