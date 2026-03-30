import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import * as bcrypt from 'bcryptjs';

describe('Auth Integration', () => {
  let app: INestApplication;
  const mockPrisma = createMockPrismaService();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
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
        id: 'u1', email: 'new@test.com', role: 'VIEWER',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@test.com', password: 'password123', tenantId: 't1', role: 'VIEWER' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('new@test.com');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123', tenantId: 't1', role: 'VIEWER' });

      expect(res.status).toBe(400);
    });

    it('should reject registration with ADMIN role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'admin@test.com', password: 'password123', tenantId: 't1', role: 'ADMIN' });

      expect(res.status).toBe(400);
    });

    it('should return 409 when email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'dup@test.com', password: 'password123', tenantId: 't1', role: 'VIEWER' });

      expect(res.status).toBe(409);
    });

    it('should reject extra fields with forbidNonWhitelisted', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'x@test.com', password: 'password123', tenantId: 't1', role: 'VIEWER', hack: true });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return access_token for valid credentials', async () => {
      const hash = await bcrypt.hash('password', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'user@test.com', passwordHash: hash, role: 'VIEWER', tenantId: 't1',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
    });

    it('should return 401 for invalid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });

    it('should return 401 for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'user@test.com', passwordHash: hash, role: 'VIEWER', tenantId: 't1',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });

    it('should reject missing password field', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com' });

      expect(res.status).toBe(400);
    });
  });
});
