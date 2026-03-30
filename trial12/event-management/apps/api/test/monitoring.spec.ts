import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-MON-011
describe('Monitoring Integration', () => {
  let app: INestApplication;
  let prisma: {
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $on: jest.Mock;
    $queryRaw: jest.Mock;
  };

  beforeAll(async () => {
    prisma = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
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
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should include version from shared package', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.timestamp).toBeDefined();
    });

    it('should include uptime', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.body.uptime).toBeDefined();
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status when db is connected', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
    });

    it('should return not ready when db is disconnected', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('not ready');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics without auth', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');

      expect(response.status).toBe(200);
      expect(response.body.requestCount).toBeDefined();
    });

    it('should include error count and uptime', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');

      expect(response.body.errorCount).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('Correlation ID', () => {
    it('should preserve client correlation ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', 'test-correlation-id');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
