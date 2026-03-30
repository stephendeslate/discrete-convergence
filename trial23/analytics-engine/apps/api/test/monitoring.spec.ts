import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin } from './helpers/test-utils';

process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/analytics_test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-min-32-chars!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-min-32!!';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return ok status without auth (public endpoint)', async () => {
      const res = await request(app.getHttpServer())
        .get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version');
    });

    it('should return X-Response-Time header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/\d+ms/);
    });

    it('should return X-Correlation-ID header when one is sent', async () => {
      const correlationId = 'test-corr-id-12345';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId);

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should generate a correlation ID when none is provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(typeof res.headers['x-correlation-id']).toBe('string');
    });
  });

  describe('GET /health/ready', () => {
    it('should return database connection status', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('database');
    });
  });

  describe('GET /metrics', () => {
    it('should require auth and return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });

    it('should return metrics with valid auth', async () => {
      const tokens = await registerAndLogin(app);

      const res = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });
});
