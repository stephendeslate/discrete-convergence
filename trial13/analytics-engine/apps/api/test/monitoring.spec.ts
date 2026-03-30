import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService, MockThrottlerGuard } from './helpers/test-utils';
import { APP_VERSION } from '@analytics-engine/shared';

describe('Monitoring Integration Tests', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeAll(async () => {
    prisma = createMockPrismaService();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(ThrottlerGuard)
      .useClass(MockThrottlerGuard)
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

  describe('GET /health', () => {
    it('should return health status without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('version', APP_VERSION);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should include X-Correlation-ID header when provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', 'test-correlation-123')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body.version).toBe(APP_VERSION);
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status when DB is connected', async () => {
      prisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('database', 'connected');
    });

    it('should return not ready when DB fails', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('DB down'));

      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'not_ready');
      expect(response.body).toHaveProperty('database', 'disconnected');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('requests');
      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
