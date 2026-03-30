import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { App } from 'supertest/types';

describe('Auth Integration', () => {
  let app: INestApplication;
  const mockPrisma = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
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
    it('should register a new user successfully', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id-1',
        email: 'test@test.com',
        role: 'DISPATCHER',
        tenantId: 'tenant-1',
        name: 'Test User',
      });

      const response = await request(app.getHttpServer() as App)
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'TestPass123!',
          name: 'Test User',
          tenantId: 'tenant-1',
          role: 'DISPATCHER',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer() as App)
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'TestPass123!',
          name: 'Test',
          tenantId: 'tenant-1',
          role: 'DISPATCHER',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer() as App)
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'TestPass123!',
          name: 'Admin',
          tenantId: 'tenant-1',
          role: 'ADMIN',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app.getHttpServer() as App)
        .post('/auth/register')
        .send({
          email: 'test@test.com',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with extra fields', async () => {
      const response = await request(app.getHttpServer() as App)
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'TestPass123!',
          name: 'Test',
          tenantId: 'tenant-1',
          role: 'DISPATCHER',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with invalid email format', async () => {
      const response = await request(app.getHttpServer() as App)
        .post('/auth/login')
        .send({
          email: 'bad-email',
          password: 'TestPass123!',
        });

      expect(response.status).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const response = await request(app.getHttpServer() as App)
        .post('/auth/login')
        .send({
          email: 'test@test.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Protected endpoints', () => {
    it('should return 401 for missing token', async () => {
      const response = await request(app.getHttpServer() as App)
        .get('/vehicles');

      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app.getHttpServer() as App)
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
