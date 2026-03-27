import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-app';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueEmail = () =>
    `auth-test-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`;

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail(),
          password: 'password123',
          name: 'Test User',
          tenantName: 'Test Tenant',
        })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toContain('@example.com');
    });

    it('should reject registration with duplicate email', async () => {
      const email = uniqueEmail();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
          tenantName: 'Test Tenant',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User 2',
          tenantName: 'Test Tenant',
        })
        .expect(409);
    });

    it('should reject registration with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test User',
          tenantName: 'Test Tenant',
        })
        .expect(400);
    });

    it('should reject registration with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: uniqueEmail() })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = uniqueEmail();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
          tenantName: 'Test Tenant',
        });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'password123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
    });

    it('should reject login with invalid password - unauthorized', async () => {
      const email = uniqueEmail();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
          tenantName: 'Test Tenant',
        });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject login with nonexistent email - unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    });
  });
});
