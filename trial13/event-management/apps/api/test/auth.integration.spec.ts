import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getMockPrisma } from './helpers/test-utils';
import * as bcryptjs from 'bcryptjs';

describe('Auth Integration', () => {
  let app: INestApplication;
  let mockPrisma: ReturnType<typeof getMockPrisma>;

  beforeAll(async () => {
    app = await createTestApp();
    mockPrisma = getMockPrisma();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'user-1',
        email: 'newuser@test.com',
        name: 'New User',
        role: 'VIEWER',
        tenantId: 'test-tenant',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'newuser@test.com', password: 'password123', name: 'New User', tenantId: 'test-tenant', role: 'VIEWER' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('newuser@test.com');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123', name: 'Test', tenantId: 'some-id', role: 'VIEWER' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with ADMIN role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'admin@test.com', password: 'password123', name: 'Admin', tenantId: 'some-id', role: 'ADMIN' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'incomplete@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });

    it('should reject registration with extra fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'extra@test.com', password: 'password123', name: 'Test', tenantId: 'id', role: 'VIEWER', admin: true });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await bcryptjs.hash('password123', 12);
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-1',
        email: 'loginuser@test.com',
        passwordHash: hashedPassword,
        name: 'Login User',
        role: 'VIEWER',
        tenantId: 'test-tenant',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'loginuser@test.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.access_token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const hashedPassword = await bcryptjs.hash('correctpassword', 12);
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-1',
        email: 'loginuser@test.com',
        passwordHash: hashedPassword,
        name: 'Login User',
        role: 'VIEWER',
        tenantId: 'test-tenant',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'loginuser@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should reject login with invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('Protected routes', () => {
    it('should return 401 for protected route without token', async () => {
      const res = await request(app.getHttpServer()).get('/events');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should return 401 for expired token format', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlZJRVdFUiIsInRlbmFudElkIjoiMSIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDAwMDAxfQ.invalid');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });
});
