import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Security Integration', () => {
  let app: INestApplication;
  let prismaService: {
    $connect: jest.Mock; $disconnect: jest.Mock; $queryRaw: jest.Mock; $on: jest.Mock; $executeRaw: jest.Mock;
    vehicle: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
    user: { findFirst: jest.Mock; findUnique: jest.Mock; create: jest.Mock };
    driver: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
    dispatch: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
    route: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };

  beforeAll(async () => {
    prismaService = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
      $on: jest.fn(),
      $executeRaw: jest.fn(),
      vehicle: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
      driver: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      dispatch: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      route: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
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

  describe('Authentication enforcement', () => {
    it('should reject GET /vehicles without auth', async () => {
      const res = await request(app.getHttpServer()).get('/vehicles');
      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject GET /drivers without auth', async () => {
      const res = await request(app.getHttpServer()).get('/drivers');
      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject GET /dispatches without auth', async () => {
      const res = await request(app.getHttpServer()).get('/dispatches');
      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject GET /routes without auth', async () => {
      const res = await request(app.getHttpServer()).get('/routes');
      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject with invalid JWT token', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject with missing Bearer prefix', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'some-token');
      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('Validation enforcement', () => {
    it('should reject invalid registration data', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject unknown fields (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'pass123',
          name: 'Test',
          role: 'DRIVER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
          unknownField: 'hacker',
        });
      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('Public endpoint access', () => {
    it('should allow health endpoint without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should allow metrics endpoint without auth', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.body.requestCount).toBeDefined();
    });
  });

  describe('Error response sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/nonexistent-route');
      expect(res.body.stack).toBeUndefined();
      expect(res.body.correlationId).toBeDefined();
    });

    it('should include correlationId in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('X-Correlation-ID', 'test-corr-id');
      expect(res.body.correlationId).toBe('test-corr-id');
      expect(res.body.statusCode).toBe(401);
    });
  });
});
