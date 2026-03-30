import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('Security Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockPrisma = createMockPrismaService();
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
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

  describe('Validation', () => {
    it('should reject unknown fields on registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          role: 'ORGANIZER',
          tenantId: 'tenant-1',
          unknownField: 'should-be-rejected',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject short passwords', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'short',
          role: 'ORGANIZER',
          tenantId: 'tenant-1',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should reject empty body on login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('Authentication', () => {
    it('should return 401 for missing token on protected routes', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for invalid JWT format', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer not-a-valid-jwt')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for missing Authorization header', async () => {
      const response = await request(app.getHttpServer())
        .get('/venues')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Error sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body.stack).toBeUndefined();
      expect(response.body.statusCode).toBe(404);
    });

    it('should include correlationId in error responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })
        .expect(401);

      expect(response.body.correlationId).toBeDefined();
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Public endpoints', () => {
    it('should allow health without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    it('should allow auth/login without auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect([401, 200]).toContain(response.status);
      expect(response.body).toBeDefined();
    });
  });
});
