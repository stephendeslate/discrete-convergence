import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers/test-app';
import { APP_VERSION } from '@repo/shared';

describe('Monitoring', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    token = generateTestToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
    });

    it('should include version from APP_VERSION', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.version).toBe(APP_VERSION);
    });

    it('should include timestamp and uptime', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(typeof res.body.timestamp).toBe('string');
      expect(typeof res.body.uptime).toBe('number');
    });

    it('should be accessible without auth (public)', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
    });

    it('should have rate-limit headers (no @SkipThrottle on health)', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const rateLimitHeader =
        res.headers['x-ratelimit-limit'] ?? res.headers['x-ratelimit-remaining'];
      expect(rateLimitHeader).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('GET /monitoring/metrics', () => {
    it('should return metrics (authenticated)', async () => {
      const res = await request(app.getHttpServer())
        .get('/monitoring/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalRequests');
      expect(res.body).toHaveProperty('totalErrors');
      expect(res.body).toHaveProperty('errorRate');
      expect(res.body).toHaveProperty('requestsByMethod');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
    });

    it('should return 401 for metrics without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/monitoring/metrics')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });
  });
});
