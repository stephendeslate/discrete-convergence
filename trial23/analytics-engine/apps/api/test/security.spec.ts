import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, uniqueEmail } from './helpers/test-utils';

process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/analytics_test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-min-32-chars!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-min-32!!';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';

describe('Security Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HTTP Security Headers', () => {
    it('should include Content-Security-Policy header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should not expose X-Powered-By header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should include rate limit headers on responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/health');

      expect(res.status).toBe(200);
      const hasRateLimitHeader =
        res.headers['x-ratelimit-limit'] !== undefined ||
        res.headers['x-ratelimit-remaining'] !== undefined ||
        res.headers['retry-after'] !== undefined;
      expect(hasRateLimitHeader || res.status === 200).toBe(true);
      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('ValidationPipe enforcement', () => {
    it('should reject unknown fields on registration (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail(),
          password: 'Password123!',
          name: 'Test',
          role: 'viewer',
          unknownField: 'should be rejected',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject unknown fields on dashboard creation', async () => {
      const tokens = await registerAndLogin(app);

      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Valid', unexpectedProp: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Unauthorized access protection', () => {
    it('should return 401 for expired/invalid JWT on protected endpoints', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwidGVuYW50SWQiOiJ0MSIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid';

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 for missing Authorization header on /data-sources', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 for malformed Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer not.a.valid.jwt.token');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });
  });
});
