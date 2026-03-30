import * as request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Auth Integration', () => {
  const { getApp } = useTestApp({ validation: true });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'EDITOR',
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
  });
});
