// TRACED:TEST-AUTH-INTEGRATION — Integration tests for auth endpoints
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TEST_ORG_ID } from './helpers/test-utils';

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
        .send({ email: 'not-email', password: 'SecurePass1', organizationId: TEST_ORG_ID });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject weak password (too short)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'weak', organizationId: TEST_ORG_ID });
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject password without uppercase', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'alllowercase1', organizationId: TEST_ORG_ID });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject missing organizationId', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'SecurePass1' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject non-UUID organizationId (invalid format)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'SecurePass1', organizationId: 'not-a-uuid' });
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

    it('should reject unknown fields (whitelist)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass1',
          organizationId: TEST_ORG_ID,
          role: 'ADMIN',
        });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject null email value', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: null, password: 'SecurePass1', organizationId: TEST_ORG_ID });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject duplicate email registration with conflict', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'SecurePass1', organizationId: TEST_ORG_ID });
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@example.com', password: 'SecurePass1', organizationId: TEST_ORG_ID });
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

    it('should reject invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-email', password: 'SecurePass1' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject empty refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: '' });
      expect(res.status).toBe(400);
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

  describe('GET /auth/me', () => {
    it('should reject without token (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject with invalid token (forbidden access)', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
