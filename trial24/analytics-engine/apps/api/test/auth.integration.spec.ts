// TRACED:TEST-AUTH-INTEGRATION — Integration tests for auth endpoints
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /auth/register', () => {
    it('should reject invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid', password: 'password123', tenantId: '00000000-0000-0000-0000-000000000001' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject short password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'short', tenantId: '00000000-0000-0000-0000-000000000001' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject missing tenantId', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject duplicate registration with conflict error', async () => {
      // First attempt
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'password123', tenantId: '00000000-0000-0000-0000-000000000001' });
      // Second attempt with same email should fail
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'password123', tenantId: '00000000-0000-0000-0000-000000000001' });
      expect([400, 409]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject missing password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should return unauthorized for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });

    it('should reject malformed refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'malformed-token' });
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });
});
