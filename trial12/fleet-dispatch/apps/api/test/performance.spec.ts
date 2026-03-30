import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Performance Integration', () => {
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

  describe('Response Time Headers', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/\d+.*ms/);
    });

    it('should include X-Response-Time on metrics endpoint', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on health endpoint', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Correlation ID', () => {
    it('should return correlation ID header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['x-correlation-id'].length).toBeGreaterThan(0);
    });

    it('should preserve client-provided correlation ID', async () => {
      const correlationId = 'test-perf-correlation-123';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId);
      expect(res.headers['x-correlation-id']).toBe(correlationId);
      expect(res.status).toBe(200);
    });
  });

  describe('Health endpoint performance', () => {
    it('should respond quickly to health checks', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer()).get('/health');
      const duration = Date.now() - start;
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });

    it('should include uptime in health response', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.body.uptime).toBeDefined();
      expect(typeof res.body.uptime).toBe('number');
    });
  });
});
