import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import * as bcrypt from 'bcryptjs';

describe('Auth Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    dashboard: { findMany: jest.fn(), count: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn() },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@example.com',
        name: 'New User',
        role: 'USER',
        tenantId: 'tenant-001',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          role: 'USER',
          tenantId: 'tenant-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('new@example.com');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
    });

    it('should reject registration with existing email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing',
        email: 'existing@example.com',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
          role: 'USER',
          tenantId: 'tenant-001',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email already registered');
    });

    it('should reject registration with invalid role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          name: 'Admin Attempt',
          role: 'ADMIN',
          tenantId: 'tenant-001',
        });

      expect(res.status).toBe(400);
      expect(JSON.stringify(res.body.message)).toContain('role must be one of');
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('should reject extra fields (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-001',
          extraField: 'should-be-rejected',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with invalid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nouser@example.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'nouser@example.com' },
      });
    });

    it('should reject login with wrong password', async () => {
      const hashed = await bcrypt.hash('correct_password', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: hashed,
        name: 'User',
        role: 'USER',
        tenantId: 'tenant-001',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'wrong_password' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should login with valid credentials and return token', async () => {
      const hashed = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: hashed,
        name: 'User',
        role: 'USER',
        tenantId: 'tenant-001',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.email).toBe('user@example.com');
    });

    it('should reject login with missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Auth guard', () => {
    it('should reject unauthenticated requests to protected routes', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should reject requests with expired token format', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.invalid');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });
});
