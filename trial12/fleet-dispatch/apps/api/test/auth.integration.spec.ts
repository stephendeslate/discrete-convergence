import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Auth Integration', () => {
  let app: INestApplication;
  let prismaService: { user: { findFirst: jest.Mock; findUnique: jest.Mock; create: jest.Mock }; $connect: jest.Mock; $disconnect: jest.Mock; $queryRaw: jest.Mock; $on: jest.Mock; $executeRaw: jest.Mock };

  beforeAll(async () => {
    prismaService = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
      $on: jest.fn(),
      $executeRaw: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: '1', email: 'test@test.com', role: 'DRIVER',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
          role: 'DRIVER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('test@test.com');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test',
          role: 'DRIVER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      prismaService.user.findFirst.mockResolvedValue({ id: '1', email: 'dup@test.com' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'dup@test.com',
          password: 'password123',
          name: 'Dup User',
          role: 'DRIVER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already');
    });
  });

  describe('POST /auth/login', () => {
    it('should return 400 for invalid login body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-valid' });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'bad@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });
});
