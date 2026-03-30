import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { App } from 'supertest/types';

describe('Monitoring Integration', () => {
  let app: INestApplication;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $executeRaw: jest.fn(),
    user: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn() },
    vehicle: { findMany: jest.fn(), count: jest.fn() },
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

  describe('GET /health', () => {
    it('should return health status without auth', async () => {
      const response = await request(app.getHttpServer() as App).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /health/ready', () => {
    it('should check database connectivity without auth', async () => {
      const response = await request(app.getHttpServer() as App).get(
        '/health/ready',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('database', 'connected');
    });

    it('should return 500 when database is unavailable', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB connection failed'));

      const response = await request(app.getHttpServer() as App).get(
        '/health/ready',
      );

      expect(response.status).toBe(500);
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics without auth', async () => {
      const response = await request(app.getHttpServer() as App).get(
        '/metrics',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('POST /errors', () => {
    it('should accept error reports without auth', async () => {
      const response = await request(app.getHttpServer() as App)
        .post('/errors')
        .send({ message: 'Frontend error', url: '/dashboard' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('received', true);
    });
  });
});
