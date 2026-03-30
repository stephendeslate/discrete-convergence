import request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Auth Integration', () => {
  const { getApp } = useTestApp();

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'DISPATCHER',
          tenantId: 'test-tenant-id',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should reject ADMIN role registration', async () => {
      await request(getApp().getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: 'test-tenant-id',
        })
        .expect(400);
    });

    it('should reject registration with missing email', async () => {
      await request(getApp().getHttpServer())
        .post('/auth/register')
        .send({
          password: 'password123',
          role: 'DISPATCHER',
          tenantId: 'test-tenant-id',
        })
        .expect(400);
    });

    it('should reject registration with short password', async () => {
      await request(getApp().getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          role: 'DISPATCHER',
          tenantId: 'test-tenant-id',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      await request(getApp().getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject login with missing password', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
    });

    it('should reject login with invalid email format', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject refresh with missing token', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/refresh')
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
