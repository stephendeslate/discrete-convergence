import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import * as bcrypt from 'bcryptjs';
import type { Server } from 'http';
import { createTestApp, createMockPrismaService, generateTestToken } from './helpers/test-utils';

describe('Auth Integration', () => {
  let app: INestApplication;
  let server: Server;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeAll(async () => {
    mockPrisma = createMockPrismaService();
    app = await createTestApp(mockPrisma);
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TRACED: AE-AUTH-007
  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'USER',
        tenantId: 'tenant-001',
      });

      const res = await request(server)
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
          role: 'USER',
          tenantId: 'tenant-001',
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should reject registration with ADMIN role', async () => {
      const res = await request(server)
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          name: 'Admin User',
          role: 'ADMIN',
          tenantId: 'tenant-001',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(server)
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-001',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with short password', async () => {
      const res = await request(server)
        .post('/auth/register')
        .send({
          email: 'valid@test.com',
          password: 'short',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-001',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject extra fields (forbidNonWhitelisted)', async () => {
      const res = await request(server)
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-001',
          isAdmin: true,
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'login@test.com',
        password: hashedPassword,
        name: 'Login User',
        role: 'USER',
        tenantId: 'tenant-001',
      });

      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'login@test.com', password: 'password123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should reject login with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'login@test.com',
        password: hashedPassword,
        role: 'USER',
        tenantId: 'tenant-001',
      });

      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'login@test.com', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'nouser@test.com', password: 'password123' })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /auth/profile', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(server)
        .get('/auth/profile')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should return profile for authenticated user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'profile@test.com',
        role: 'USER',
        tenantId: 'tenant-001',
      });

      const token = generateTestToken(app, {
        sub: 'user-1',
        email: 'profile@test.com',
        role: 'USER',
        tenantId: 'tenant-001',
      });

      const res = await request(server)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('sub');
      expect(res.body).toHaveProperty('email', 'profile@test.com');
    });

    it('should reject invalid JWT token', async () => {
      const res = await request(server)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });
  });
});
