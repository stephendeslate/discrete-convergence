import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import {
  createTestApp,
  generateToken,
  PrismaMock,
  TEST_USER,
} from './helpers/test-app';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$12$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaMock;
  let token: string;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    module = ctx.module;
    prisma = ctx.prisma;
    token = generateToken(module, TEST_USER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user-001',
        email: 'new@test.com',
        role: 'DISPATCHER',
        name: 'New User',
        password: '$2a$12$hashedpassword',
        companyId: 'company-001',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@test.com',
          password: 'password123',
          name: 'New User',
          role: 'DISPATCHER',
          companyId: 'company-001',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'new-user-001');
      expect(res.body).toHaveProperty('email', 'new@test.com');
      expect(res.body).toHaveProperty('role', 'DISPATCHER');
    });

    it('should return 409 for duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@test.com',
        role: 'DISPATCHER',
        name: 'Existing',
        password: '$2a$12$hashedpassword',
        companyId: 'company-001',
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'existing@test.com',
          password: 'password123',
          name: 'Dup User',
          role: 'DISPATCHER',
          companyId: 'company-001',
        })
        .expect(409);
    });

    it('should return 400 for invalid role (ADMIN not allowed)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@newtest.com',
          password: 'password123',
          name: 'Admin User',
          role: 'ADMIN',
          companyId: 'company-001',
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'noname@test.com' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login and return access_token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-001',
        email: 'admin@test.com',
        password: '$2a$12$hashedpassword',
        role: 'ADMIN',
        name: 'Admin',
        companyId: 'company-001',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should return 401 for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-001',
        email: 'admin@test.com',
        password: '$2a$12$hashedpassword',
        role: 'ADMIN',
        name: 'Admin',
        companyId: 'company-001',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile with valid token', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-001',
        email: 'admin@test.com',
        name: 'Admin',
        role: 'ADMIN',
        companyId: 'company-001',
      });

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', 'admin@test.com');
      expect(res.body).toHaveProperty('role', 'ADMIN');
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid Bearer token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer garbage.token.here')
        .expect(401);
    });
  });

  describe('POST /auth/register edge cases', () => {
    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Bad Email User',
          role: 'DISPATCHER',
          companyId: 'company-001',
        })
        .expect(400);
    });
  });
});
