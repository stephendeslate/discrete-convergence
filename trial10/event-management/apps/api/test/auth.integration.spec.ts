import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockPrisma = createMockPrismaService();
    mockPrisma.user.findFirst.mockResolvedValue(null);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          role: 'ORGANIZER',
          tenantId: 'tenant-1',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should reject ADMIN role registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with missing credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Protected routes', () => {
    it('should return 401 for unauthenticated request to events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for unauthenticated request to venues', async () => {
      const response = await request(app.getHttpServer())
        .get('/venues')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for unauthenticated request to tickets', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for unauthenticated request to registrations', async () => {
      const response = await request(app.getHttpServer())
        .get('/registrations')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 with expired token format', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwidGVuYW50SWQiOiJ0MSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });
});
