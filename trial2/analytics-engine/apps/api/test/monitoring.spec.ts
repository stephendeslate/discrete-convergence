import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED:AE-TEST-004 — Monitoring integration tests with supertest
describe('Monitoring Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
      expect(res.body.version).toBe(APP_VERSION);
    });

    it('should be accessible without auth', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
    });
  });

  describe('GET /health/ready', () => {
    it('should check database readiness', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(res.body).toHaveProperty('requestCount');
      expect(res.body).toHaveProperty('errorCount');
      expect(res.body).toHaveProperty('averageResponseTime');
      expect(res.body).toHaveProperty('uptime');
    });

    it('should be accessible without auth', async () => {
      await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);
    });
  });

  describe('Correlation ID', () => {
    it('should preserve client correlation ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', 'custom-id-123')
        .expect(200);

      expect(res.headers['x-correlation-id']).toBe('custom-id-123');
    });

    it('should generate correlation ID when not provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-correlation-id']).toBeDefined();
    });
  });
});
