import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetMocks, mockPrisma } from './helpers/test-app';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Integration (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const result = await createTestApp();
    app = result.app;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks(mockPrisma);
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', slug: 'default' });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'StrongP@ss1', name: 'Test User' })
        .expect(201);

      expect(response.body.email).toBe('test@example.com');
      expect(response.body.role).toBe('USER');
      expect(response.body.id).toBe('user-1');
    });

    it('should return 409 if email already registered', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', slug: 'default' });
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'taken@example.com', password: 'StrongP@ss1', name: 'Dup User' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });

    it('should return 400 for invalid registration data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject extra fields (forbidNonWhitelisted)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'a@b.com', password: 'StrongP@ss1', name: 'X', hackerField: 'inject' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login and return tokens', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
        tenantId: 'tenant-1',
        role: 'USER',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'StrongP@ss1' })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should return 401 for wrong credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'WrongPass1!' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
        tenantId: 'tenant-1',
        role: 'USER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPass1!' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 400 for missing login fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });
});
