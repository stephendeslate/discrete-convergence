import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';
import { NoopThrottlerGuard } from './helpers/test-utils';

// TRACED: AE-MON-009
describe('Monitoring Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ThrottlerGuard)
      .useClass(NoopThrottlerGuard)
      .overrideProvider(PrismaService)
      .useValue({
        user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
        dashboard: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        widget: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        dataSource: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $executeRaw: jest.fn().mockResolvedValue(1),
      })
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

  describe('GET /health', () => {
    it('should return health status with version', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness with database status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBeDefined();
    });
  });

  describe('GET /metrics', () => {
    it('should return request metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('avgResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics');

      expect(response.status).toBe(200);
      expect(typeof response.body.requestCount).toBe('number');
    });
  });

  describe('Correlation ID', () => {
    it('should return X-Correlation-ID header on all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['x-correlation-id']).toBeDefined();
    });

    it('should preserve client-provided correlation ID', async () => {
      const clientId = 'test-correlation-123';
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientId);

      expect(response.status).toBe(200);
      expect(response.headers['x-correlation-id']).toBe(clientId);
    });
  });

  describe('POST /errors', () => {
    it('should accept frontend error reports', async () => {
      const response = await request(app.getHttpServer())
        .post('/errors')
        .send({
          message: 'Test error',
          stack: 'Error: Test\n  at test.ts:1',
          url: '/dashboard',
        });

      expect(response.status).toBe(201);
      expect(response.body.received).toBe(true);
    });

    it('should accept error reports with minimal data', async () => {
      const response = await request(app.getHttpServer())
        .post('/errors')
        .send({ message: 'Minimal error' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Minimal error');
    });
  });
});
