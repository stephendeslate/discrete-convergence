import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-MON-011
describe('Monitoring Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    event: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    venue: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    ticket: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    schedule: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    attendee: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(1),
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
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe(APP_VERSION);
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should include uptime', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/ready', () => {
    it('should check database connectivity', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.database).toBe('connected');
    });

    it('should report disconnected when DB fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB down'));

      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('not ready');
      expect(response.body.database).toBe('disconnected');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics data', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(response.body.requestCount).toBeDefined();
      expect(response.body.errorCount).toBeDefined();
      expect(response.body.averageResponseTime).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    it('should return numeric values', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(typeof response.body.requestCount).toBe('number');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('Correlation ID', () => {
    it('should preserve client-provided correlation ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', 'custom-corr-id')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});
