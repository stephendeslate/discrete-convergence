import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Monitoring Integration (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(0),
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
    it('should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should be publicly accessible (no auth required)', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /health/ready', () => {
    it('should return database readiness', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database', 'connected');
    });

    it('should handle db failure gracefully', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB down'));
      const response = await request(app.getHttpServer()).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('database', 'disconnected');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics data', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('POST /errors', () => {
    it('should accept error reports', async () => {
      const response = await request(app.getHttpServer())
        .post('/errors')
        .send({ message: 'Client error', stack: 'at component.tsx:10' });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('received', true);
    });
  });
});
