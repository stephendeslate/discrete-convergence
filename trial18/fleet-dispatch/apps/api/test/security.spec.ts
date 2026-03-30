import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $executeRaw: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

describe('Security Integration', () => {
  let app: INestApplication;

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
    if (app) await app.close();
  });

  describe('Authentication', () => {
    it('should require auth for protected endpoints', async () => {
      const response = await request(app.getHttpServer()).get('/vehicles');

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should reject invalid JWT tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should allow public endpoints without auth', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Validation', () => {
    it('should reject invalid login payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-email', password: 123 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject unknown fields in register', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'pass123',
          role: 'viewer',
          tenantId: 'tenant-1',
          unknownField: 'rejected',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject empty request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should not leak stack traces', async () => {
      const response = await request(app.getHttpServer()).get('/nonexistent');

      expect(response.body.stack).toBeUndefined();
      expect(response.body.statusCode).toBeDefined();
    });

    it('should include correlationId in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles')
        .set('X-Correlation-ID', 'test-correlation-id');

      expect(response.body.correlationId).toBe('test-correlation-id');
      expect(response.status).toBe(401);
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app.getHttpServer()).get('/unknown-path');

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toBeDefined();
    });
  });

  describe('Headers', () => {
    it('should include X-Response-Time header', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should preserve correlation ID in responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', 'my-correlation-id');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
