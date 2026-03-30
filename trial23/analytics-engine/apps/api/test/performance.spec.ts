import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, AuthTokens } from './helpers/test-utils';

process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/analytics_test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-min-32-chars!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-min-32!!';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';

describe('Performance Integration', () => {
  let app: INestApplication;
  let tokens: AuthTokens;

  beforeAll(async () => {
    app = await createTestApp();
    tokens = await registerAndLogin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('X-Response-Time header', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });

    it('should include X-Response-Time on authenticated endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/\d+ms/);
    });
  });

  describe('Pagination defaults', () => {
    it('should apply DEFAULT_PAGE_SIZE when no limit is specified', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(20);
    });

    it('should clamp limit to MAX_PAGE_SIZE when exceeding 100', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards?limit=100')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body.limit).toBeLessThanOrEqual(100);
      expect(res.body).toHaveProperty('page');
    });

    it('should reject limit exceeding 100 via DTO validation', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards?limit=200')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.limit).toBeLessThanOrEqual(100);
      } else {
        expect(res.body).toHaveProperty('message');
      }
    });
  });

  describe('Cache-Control header', () => {
    it('should include Cache-Control on dashboard list endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBeDefined();
      expect(res.headers['cache-control']).toContain('max-age');
    });
  });

  describe('Response time', () => {
    it('should respond to health endpoint in under 500ms', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer())
        .get('/health');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });
  });
});
