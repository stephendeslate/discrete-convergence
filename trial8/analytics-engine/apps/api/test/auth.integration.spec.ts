import request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Auth Integration', () => {
  const { getApp } = useTestApp({ validation: true });

  describe('POST /auth/register', () => {
    it('should reject registration with missing required fields', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/register')
        .send({ email: 'partial@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject ADMIN role registration via validation', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: 'test-tenant-id',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject registration with invalid email format', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          role: 'USER',
          tenantId: 'tid',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject login with missing password', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject refresh with missing token', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });
});
