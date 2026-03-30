import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $executeRaw: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

describe('Monitoring Integration', () => {
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

  describe('GET /monitoring/health', () => {
    it('should return health status without auth', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should include required health fields', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/health');

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(response.body.version).toBeDefined();
    });

    it('should include X-Response-Time header', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.status).toBe(200);
    });
  });

  describe('GET /monitoring/readiness', () => {
    it('should return readiness status without auth', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/readiness');

      expect(response.status).toBe(200);
      expect(response.body.status).toBeDefined();
    });

    it('should include database status', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/readiness');

      expect(response.body.database).toBeDefined();
      expect(response.status).toBe(200);
    });
  });

  describe('GET /monitoring/metrics', () => {
    it('should return metrics without auth', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/metrics');

      expect(response.status).toBe(200);
      expect(response.body.requestCount).toBeDefined();
    });

    it('should include all metrics fields', async () => {
      const response = await request(app.getHttpServer()).get('/monitoring/metrics');

      expect(response.body.errorCount).toBeDefined();
      expect(response.body.averageResponseTime).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });
});
