import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  createTestApp,
  generateToken,
  PrismaMock,
  TEST_USER,
} from './helpers/test-app';

describe('Monitoring Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaMock;
  let token: string;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    module = ctx.module;
    prisma = ctx.prisma;
    token = generateToken(module, TEST_USER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.healthCheck.mockResolvedValue(true);
  });

  describe('GET /health', () => {
    it('should return health status ok when database is healthy', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version');
      expect(res.body.checks).toHaveProperty('database', true);
    });

    it('should return degraded status when database is unhealthy', async () => {
      prisma.healthCheck.mockResolvedValue(false);

      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'degraded');
      expect(res.body.checks).toHaveProperty('database', false);
    });

    it('should be accessible without authentication (public endpoint)', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status');
    });

    it('should include rate-limit headers', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers).toHaveProperty('x-ratelimit-limit');
    });
  });

  describe('GET /metrics', () => {
    it('should return system metrics with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('memory');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should include system uptime as a number', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.uptime).toBeGreaterThan(0);
    });

    it('should include memory usage details', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.memory).toHaveProperty('rss');
      expect(res.body.memory).toHaveProperty('heapTotal');
      expect(res.body.memory).toHaveProperty('heapUsed');
      expect(res.body.memory).toHaveProperty('external');
      expect(typeof res.body.memory.rss).toBe('number');
    });

    it('should include X-Response-Time header', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });
  });

  describe('Authentication on metrics', () => {
    it('should return 401 for metrics without token', async () => {
      await request(app.getHttpServer())
        .get('/metrics')
        .expect(401);
    });

    it('should include X-Correlation-ID header on health endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-correlation-id']).toBeDefined();
    });
  });
});
