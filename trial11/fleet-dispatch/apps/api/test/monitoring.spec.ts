import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
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
    it('should return health status without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
      expect(res.body.version).toBeDefined();
    });

    it('should include X-Response-Time header', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Correlation-ID header', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('should preserve client-provided correlation ID', async () => {
      const customId = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', customId);

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBe(customId);
    });
  });

  describe('GET /health/ready', () => {
    it('should check database connectivity', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.database).toBe('connected');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should not require authentication', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics without auth', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.body.requestCount).toBeDefined();
      expect(res.body.errorCount).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });
  });

  describe('POST /errors', () => {
    it('should accept error reports', async () => {
      const res = await request(app.getHttpServer())
        .post('/errors')
        .send({ message: 'Client error', stack: 'at component:1' });

      expect(res.status).toBe(201);
      expect(res.body.received).toBe(true);
    });
  });
});
