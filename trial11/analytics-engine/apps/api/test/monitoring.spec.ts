import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    dashboard: { findMany: jest.fn(), count: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $executeRaw: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /monitoring/health', () => {
    it('should return health status without auth', async () => {
      const res = await request(app.getHttpServer()).get('/monitoring/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.version).toBe(APP_VERSION);
    });

    it('should include timestamp and uptime', async () => {
      const res = await request(app.getHttpServer()).get('/monitoring/health');

      expect(res.status).toBe(200);
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });
  });

  describe('GET /monitoring/health/ready', () => {
    it('should return ready status when DB is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const res = await request(app.getHttpServer()).get('/monitoring/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.database).toBe('connected');
    });

    it('should return not_ready when DB is disconnected', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const res = await request(app.getHttpServer()).get('/monitoring/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('not_ready');
      expect(res.body.database).toBe('disconnected');
    });

    it('should be accessible without authentication', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const res = await request(app.getHttpServer()).get('/monitoring/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /monitoring/metrics', () => {
    it('should return metrics without auth', async () => {
      const res = await request(app.getHttpServer()).get('/monitoring/metrics');

      expect(res.status).toBe(200);
      expect(res.body.requestCount).toBeDefined();
      expect(res.body.errorCount).toBeDefined();
    });

    it('should include uptime and timestamp', async () => {
      const res = await request(app.getHttpServer()).get('/monitoring/metrics');

      expect(res.status).toBe(200);
      expect(res.body.uptime).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });

    it('should return averageResponseTime as a number', async () => {
      const res = await request(app.getHttpServer()).get('/monitoring/metrics');

      expect(res.status).toBe(200);
      expect(typeof res.body.averageResponseTime).toBe('number');
      expect(res.body.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });
});
