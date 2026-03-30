import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getTestAuthToken } from './helpers/test-utils';

describe('Security Integration', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = getTestAuthToken(app);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Authentication', () => {
    it('should reject requests without authorization header', async () => {
      const res = await request(app.getHttpServer()).get('/events');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject requests with malformed token', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer malformed-token');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should accept requests with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should reject request with extra properties', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'extra@test.com',
          password: 'password123',
          name: 'Extra',
          tenantId: 'some-id',
          role: 'VIEWER',
          isAdmin: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });

    it('should reject excessively long strings', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'a'.repeat(300) + '@test.com',
          password: 'password123',
          name: 'Test',
          tenantId: 'id',
          role: 'VIEWER',
        });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });

    it('should reject ADMIN role in registration', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@hack.com',
          password: 'password123',
          name: 'Hacker',
          tenantId: 'some-id',
          role: 'ADMIN',
        });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should not leak stack traces in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.stack).toBeUndefined();
      expect(res.body.statusCode).toBeDefined();
    });

    it('should include correlationId in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.correlationId).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Headers', () => {
    it('should include X-Response-Time header', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });
  });
});
