import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    dashboard: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health status without authentication', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('should return health ready status', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.database).toBe('connected');
  });

  it('should return metrics without authentication', async () => {
    const res = await request(app.getHttpServer()).get('/health/metrics');

    expect(res.status).toBe(200);
    expect(res.body.requestCount).toBeDefined();
    expect(res.body.uptime).toBeDefined();
  });

  it('should include X-Response-Time header', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/\d+ms/);
  });

  it('should include X-Correlation-ID header', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('should preserve client correlation ID', async () => {
    const customId = 'test-correlation-123';
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', customId);

    expect(res.headers['x-correlation-id']).toBe(customId);
  });

  it('should return version in health response', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.body.version).toBeDefined();
    expect(typeof res.body.version).toBe('string');
  });

  it('should handle database disconnection in readiness check', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app.getHttpServer()).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.database).toBe('disconnected');
  });
});
