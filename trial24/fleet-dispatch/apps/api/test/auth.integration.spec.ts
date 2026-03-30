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
        .send({ email: 'invalid', password: 'password123', companyId: '00000000-0000-0000-0000-000000000001' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject short password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'short', companyId: '00000000-0000-0000-0000-000000000001' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject missing companyId', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject null email value', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: null, password: 'password123', companyId: '00000000-0000-0000-0000-000000000001' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject duplicate email registration with conflict', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@fleet.test', password: 'password123', companyId: '00000000-0000-0000-0000-000000000001' });
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@fleet.test', password: 'password123', companyId: '00000000-0000-0000-0000-000000000001' });
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
      expect(res.body).toBeDefined();
    });

    it('should reject missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject requests with missing body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh');
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject malformed refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'malformed-token-value' });
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });
});
