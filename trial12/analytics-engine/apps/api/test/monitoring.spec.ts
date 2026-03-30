import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    dashboard: { findMany: jest.fn(), count: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn() },
    queryExecution: { findMany: jest.fn(), count: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health status', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe(APP_VERSION);
    expect(res.body.uptime).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  it('should return readiness check', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });

  it('should return metrics', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');

    expect(res.status).toBe(200);
    expect(res.body.requestCount).toBeDefined();
    expect(res.body.errorCount).toBeDefined();
    expect(res.body.averageResponseTime).toBeDefined();
    expect(res.body.uptime).toBeDefined();
  });

  it('should include correlation id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'test-corr-123');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should include x-response-time header', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('should handle readiness failure gracefully', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection failed'));

    const res = await request(app.getHttpServer()).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('not ready');
    expect(res.body.database).toBe('disconnected');
  });
});
