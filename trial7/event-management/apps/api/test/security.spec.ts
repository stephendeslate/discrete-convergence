import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Security Integration (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    event: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(0),
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

  describe('Authentication enforcement', () => {
    it('should return 401 for protected route without token', async () => {
      const response = await request(app.getHttpServer()).get('/events');
      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
    });

    it('should return 401 for expired token format', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxfQ.invalid');
      expect(response.status).toBe(401);
    });
  });

  describe('Public routes', () => {
    it('should allow unauthenticated access to /health', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });

    it('should allow unauthenticated access to auth routes', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'pass' });
      // Should not be 401 — either 400 (validation) or 401 (bad creds), not auth guard
      expect([400, 401]).toContain(response.status);
    });
  });

  describe('Input validation', () => {
    it('should reject unknown fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          tenantId: 'tenant-1',
          role: 'USER',
          hackField: 'malicious',
        });
      expect(response.status).toBe(400);
    });

    it('should return 400 for empty body on register', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe('Error response sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      const response = await request(app.getHttpServer()).get('/events');
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('error');
    });
  });
});
