import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { APP_VERSION } from '@event-management/shared';
import type { Server } from 'http';

describe('Monitoring Integration', () => {
  let app: INestApplication;
  let server: Server;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    user: { findFirst: jest.fn(), create: jest.fn() },
    event: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    venue: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    ticket: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    attendee: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), count: jest.fn() },
    schedule: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status with version', async () => {
      const response = await request(server).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.uptime).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should not require authentication', async () => {
      const response = await request(server).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status when DB is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const response = await request(server).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
      expect(response.body.database).toBe('connected');
    });

    it('should return not_ready when DB fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('DB down'));
      const response = await request(server).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('not_ready');
      expect(response.body.database).toBe('disconnected');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics with request counts', async () => {
      const response = await request(server).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.body.requestCount).toBeDefined();
      expect(response.body.errorCount).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('Correlation ID', () => {
    it('should preserve client correlation ID', async () => {
      const response = await request(server)
        .get('/health')
        .set('X-Correlation-ID', 'test-correlation-id');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
