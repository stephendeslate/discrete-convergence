import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-AUTH-009
describe('Auth Integration', () => {
  let app: INestApplication;
  let prisma: {
    user: { findFirst: jest.Mock; create: jest.Mock };
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $on: jest.Mock;
    $queryRaw: jest.Mock;
  };

  beforeAll(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
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

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@example.com',
        name: 'New User',
        role: 'USER',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('new@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for ADMIN role registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          name: 'Admin',
          role: 'ADMIN',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should return 401 for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'noone@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for invalid login body', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Protected routes', () => {
    it('should return 401 for unauthenticated access to events', async () => {
      const response = await request(app.getHttpServer()).get('/events');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should return 401 for missing token on venues', async () => {
      const response = await request(app.getHttpServer()).get('/venues');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });
});
