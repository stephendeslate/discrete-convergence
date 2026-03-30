// Set env before any imports that may read it
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-for-integration-tests';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/test';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infra/prisma.service';

export interface TestApp {
  app: INestApplication;
  prisma: MockPrisma;
}

interface MockRecord { id: string; [key: string]: unknown }

function createId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class MockModel {
  private records: MockRecord[] = [];

  async findFirst(args?: { where?: { [key: string]: unknown }; include?: unknown }): Promise<MockRecord | null> {
    if (!args?.where) return this.records[0] ?? null;
    return this.records.find((r) => {
      return Object.entries(args.where!).every(([k, v]) => r[k] === v);
    }) ?? null;
  }

  async findMany(args?: { where?: { [key: string]: unknown }; skip?: number; take?: number; orderBy?: unknown; include?: unknown }): Promise<MockRecord[]> {
    let results = [...this.records];
    if (args?.where) {
      results = results.filter((r) =>
        Object.entries(args.where!).every(([k, v]) => r[k] === v),
      );
    }
    if (args?.skip) results = results.slice(args.skip);
    if (args?.take) results = results.slice(0, args.take);
    return results;
  }

  async count(args?: { where?: { [key: string]: unknown } }): Promise<number> {
    if (!args?.where) return this.records.length;
    return this.records.filter((r) =>
      Object.entries(args.where!).every(([k, v]) => r[k] === v),
    ).length;
  }

  async create(args: { data: { [key: string]: unknown }; include?: unknown }): Promise<MockRecord> {
    const record: MockRecord = { id: createId(), ...args.data, createdAt: new Date(), updatedAt: new Date() } as MockRecord;
    this.records.push(record);
    return record;
  }

  async update(args: { where: { id: string }; data: { [key: string]: unknown } }): Promise<MockRecord> {
    const idx = this.records.findIndex((r) => r.id === args.where.id);
    if (idx >= 0) {
      this.records[idx] = { ...this.records[idx], ...args.data, updatedAt: new Date() };
      return this.records[idx];
    }
    return { id: args.where.id, ...args.data } as MockRecord;
  }

  async delete(args: { where: { id: string } }): Promise<MockRecord> {
    const idx = this.records.findIndex((r) => r.id === args.where.id);
    if (idx >= 0) {
      const [removed] = this.records.splice(idx, 1);
      return removed;
    }
    return { id: args.where.id } as MockRecord;
  }
}

class MockPrisma {
  user = new MockModel();
  tenant = new MockModel();
  dashboard = new MockModel();
  widget = new MockModel();
  dataSource = new MockModel();
  syncHistory = new MockModel();
  auditLog = new MockModel();

  async $connect() {}
  async $disconnect() {}
  async $executeRaw() { return 1; }
  async $queryRaw() { return [{ '?column?': 1 }]; }
  async setTenantContext() {}

  onModuleInit = async () => {};
  onModuleDestroy = async () => {};
}

export async function createTestApp(): Promise<TestApp> {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-for-integration-tests';
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/test';

  const mockPrisma = new MockPrisma();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma)
    .compile();

  const app = moduleFixture.createNestApplication();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, prisma: mockPrisma };
}
