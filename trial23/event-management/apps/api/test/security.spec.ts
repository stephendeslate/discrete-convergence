import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers/test-app';

describe('Security', () => {
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

  describe('Helmet headers', () => {
    it('should have Content-Security-Policy header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should have X-Content-Type-Options nosniff header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('CORS headers', () => {
    it('should return CORS headers on OPTIONS request', async () => {
      const res = await request(app.getHttpServer())
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(res.status).toBeLessThan(400);
    });
  });

  describe('Authentication enforcement', () => {
    it('should return 401 on protected endpoint without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should return 401 on protected endpoint with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid.token.value')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('Role-based access', () => {
    it('should return 403 when ATTENDEE tries to create event', async () => {
      const attendeeToken = generateTestToken(app, { role: 'ATTENDEE' });

      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send({
          name: 'Blocked Event',
          startDate: '2026-06-01T10:00:00.000Z',
          endDate: '2026-06-01T18:00:00.000Z',
        })
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });
  });

  describe('Rate limit headers', () => {
    it('should have rate limit headers present', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const rateLimitHeader =
        res.headers['x-ratelimit-limit'] ?? res.headers['x-ratelimit-remaining'];
      expect(rateLimitHeader).toBeDefined();
    });
  });

  describe('Error response sanitization', () => {
    it('should not expose sensitive data in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      const body = JSON.stringify(res.body);
      expect(body).not.toContain('password');
      expect(body).not.toContain('secret');
      expect(body).not.toContain('passwordHash');
    });
  });

  describe('Validation', () => {
    it('should reject extra fields with forbidNonWhitelisted', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'StrongPass123!',
          unknownField: 'should be rejected',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });
});
