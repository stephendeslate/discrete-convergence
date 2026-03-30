import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Monitoring Integration', () => {
  let app: INestApplication;
  const mockPrisma = {
    user: { findFirst: jest.fn() },
    event: { findMany: jest.fn(), count: jest.fn() },
    venue: { findMany: jest.fn(), count: jest.fn() },
    attendee: { findMany: jest.fn(), count: jest.fn() },
    registration: { findMany: jest.fn(), count: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $on: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should return health status without auth', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  it('should return health ready with DB check', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.database).toBe('connected');
  });

  it('should return metrics without auth', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');

    expect(res.status).toBe(200);
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

  it('should preserve client-provided correlation ID', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'client-corr-id');

    expect(res.headers['x-correlation-id']).toBe('client-corr-id');
  });

  it('should handle DB disconnection in health/ready', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app.getHttpServer()).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.database).toBe('disconnected');
  });
});
