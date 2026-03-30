import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

describe('Cross-Layer Integration', () => {
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

  describe('Full pipeline verification', () => {
    it('should return health with APP_VERSION from shared', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.version).toBe(APP_VERSION);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should enforce auth on protected endpoints and return correlation ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('X-Correlation-ID', 'cross-layer-test');
      expect(res.status).toBe(401);
      expect(res.body.correlationId).toBe('cross-layer-test');
    });

    it('should verify DB connectivity via health/ready', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);
      const res = await request(app.getHttpServer()).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.database).toBe('connected');
    });

    it('should handle DB failure gracefully in health/ready', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('Connection refused'));
      const res = await request(app.getHttpServer()).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('not ready');
      expect(res.body.database).toBe('disconnected');
    });

    it('should pass correlation IDs through error responses', async () => {
      const corrId = 'error-pipeline-test';
      const res = await request(app.getHttpServer())
        .get('/drivers')
        .set('X-Correlation-ID', corrId);
      expect(res.status).toBe(401);
      expect(res.body.correlationId).toBe(corrId);
      expect(res.headers['x-correlation-id']).toBe(corrId);
    });

    it('should generate correlation IDs when not provided', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['x-correlation-id'].length).toBeGreaterThan(0);
    });

    it('should sanitize error responses (no stack traces)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'x@x.com', password: 'wrong' });
      expect(res.body.stack).toBeUndefined();
      expect(res.body.timestamp).toBeDefined();
    });

    it('should reject requests to protected routes with invalid tokens', async () => {
      const res = await request(app.getHttpServer())
        .get('/dispatches')
        .set('Authorization', 'Bearer bad.token.value');
      expect(res.status).toBe(401);
      expect(res.body.correlationId).toBeDefined();
    });

    it('should return metrics without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');
      expect(res.status).toBe(200);
      expect(typeof res.body.requestCount).toBe('number');
      expect(typeof res.body.errorCount).toBe('number');
    });
  });
});
