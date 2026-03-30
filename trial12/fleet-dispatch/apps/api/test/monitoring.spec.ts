import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

describe('Monitoring Integration', () => {
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

  describe('GET /health', () => {
    it('should return health status with version', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.version).toBe(APP_VERSION);
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });

    it('should be accessible without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should include X-Response-Time header', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready when database connected', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.database).toBe('connected');
    });

    it('should return not ready when database fails', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('DB down'));

      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('not ready');
      expect(res.body.database).toBe('disconnected');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics data', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.body.requestCount).toBeDefined();
      expect(res.body.errorCount).toBeDefined();
      expect(res.body.averageResponseTime).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });

    it('should be accessible without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');

      expect(res.status).toBe(200);
      expect(typeof res.body.requestCount).toBe('number');
    });
  });
});
