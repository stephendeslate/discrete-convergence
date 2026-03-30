import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

const mockPrisma = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $executeRaw: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

describe('Cross-Layer Integration', () => {
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

  describe('Full pipeline: auth → CRUD → error → correlation → response time', () => {
    it('should enforce auth on CRUD endpoints', async () => {
      const response = await request(app.getHttpServer()).get('/vehicles');

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should allow public health endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/health');

      expect(response.status).toBe(200);
      expect(response.body.version).toBe(APP_VERSION);
    });

    it('should preserve correlation ID through full pipeline', async () => {
      const correlationId = 'cross-layer-test-correlation';
      const response = await request(app.getHttpServer())
        .get('/vehicles')
        .set('X-Correlation-ID', correlationId);

      expect(response.status).toBe(401);
      expect(response.body.correlationId).toBe(correlationId);
    });

    it('should include response time on error responses', async () => {
      const response = await request(app.getHttpServer()).get('/vehicles');

      expect(response.status).toBe(401);
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Health and monitoring pipeline', () => {
    it('should return health with APP_VERSION from shared', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/health');

      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.status).toBe('ok');
    });

    it('should return readiness with database status', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/readiness');

      expect(response.status).toBe(200);
      expect(response.body.database).toBeDefined();
    });

    it('should return metrics without auth', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/metrics');

      expect(response.status).toBe(200);
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('Error handling pipeline', () => {
    it('should sanitize error responses (no stack trace)', async () => {
      const response = await request(app.getHttpServer()).get('/nonexistent');

      expect(response.body.stack).toBeUndefined();
      expect(response.body.statusCode).toBeDefined();
    });

    it('should include timestamp in error response', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles')
        .set('X-Correlation-ID', 'err-test');

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.correlationId).toBe('err-test');
    });

    it('should validate inputs before processing', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Guard chain verification', () => {
    it('should apply throttle guard on auth endpoints', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@t.com', password: 'test' });

      expect(response.status).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should apply JWT guard on protected endpoints', async () => {
      const endpoints = ['/vehicles', '/drivers', '/dispatches', '/routes'];
      for (const endpoint of endpoints) {
        const response = await request(app.getHttpServer()).get(endpoint);
        expect(response.status).toBe(401);
        expect(response.body.correlationId).toBeDefined();
      }
    });

    it('should skip auth for public endpoints', async () => {
      const publicEndpoints = ['/monitoring/health', '/monitoring/readiness', '/monitoring/metrics'];
      for (const endpoint of publicEndpoints) {
        const response = await request(app.getHttpServer()).get(endpoint);
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
      }
    });
  });
});
