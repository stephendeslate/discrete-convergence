import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestApp } from './helpers/test-utils';

describe('Auth Integration', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should return 400 for invalid email', async () => { // VERIFY:EM-AUTH-V01 — registration rejects malformed email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123' });
      expect(response.status).toBe(400);
    });

    it('should return 400 for short password', async () => { // VERIFY:EM-AUTH-V02 — registration rejects short password
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'short' });
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing fields', async () => { // VERIFY:EM-AUTH-V03 — registration rejects missing required fields
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});
      expect(response.status).toBe(400);
    });

    it('should reject unknown fields with forbidNonWhitelisted', async () => { // VERIFY:EM-SEC-V01 — validation forbids non-whitelisted fields
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'password123', unknown: 'field' });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 400 for missing credentials', async () => { // VERIFY:EM-AUTH-V04 — login rejects empty body
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 400 for missing refresh token', async () => { // VERIFY:EM-AUTH-V05 — refresh rejects missing token
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({});
      expect(response.status).toBe(400);
    });
  });
});
