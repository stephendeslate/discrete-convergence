import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { sanitizeLogContext } from '@fleet-dispatch/shared';

describe('Monitoring (FD-MON)', () => {
  let app: INestApplication;

  const mockPrisma = {
    vehicle: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    user: { findFirst: jest.fn(), create: jest.fn() },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED: FD-MON-001
  it('should return health status', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
  });

  // TRACED: FD-MON-002
  it('should return health/ready status', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  // TRACED: FD-MON-003
  it('should return metrics', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body.uptime).toBeDefined();
    expect(res.body.memoryUsage).toBeDefined();
  });

  // TRACED: FD-MON-004
  it('should accept frontend error reports', async () => {
    const res = await request(app.getHttpServer())
      .post('/errors')
      .send({ message: 'Test error', stack: 'test stack' });
    expect(res.status).toBe(201);
    expect(res.body.received).toBe(true);
  });

  // TRACED: FD-MON-005
  it('sanitizeLogContext should redact password', () => {
    const result = sanitizeLogContext({ password: 'secret123', name: 'test' });
    expect((result as Record<string, unknown>).password).toBe('[REDACTED]');
    expect((result as Record<string, unknown>).name).toBe('test');
  });

  // TRACED: FD-MON-006
  it('sanitizeLogContext should redact nested sensitive fields', () => {
    const result = sanitizeLogContext({ user: { token: 'abc', name: 'John' } });
    const user = (result as Record<string, Record<string, unknown>>).user;
    expect(user.token).toBe('[REDACTED]');
    expect(user.name).toBe('John');
  });

  // TRACED: FD-MON-007
  it('sanitizeLogContext should redact fields in arrays', () => {
    const result = sanitizeLogContext([{ password: 'secret' }, { authorization: 'Bearer x' }]);
    expect((result as Record<string, unknown>[])[0].password).toBe('[REDACTED]');
    expect((result as Record<string, unknown>[])[1].authorization).toBe('[REDACTED]');
  });

  // TRACED: FD-MON-008
  it('sanitizeLogContext should handle null and primitives', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext('string')).toBe('string');
  });
});
