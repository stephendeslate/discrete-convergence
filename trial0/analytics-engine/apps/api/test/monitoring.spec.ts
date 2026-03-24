// TRACED:AE-TEST-004 — Monitoring integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@analytics-engine/shared';

describe('Monitoring Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should be accessible without authentication', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness with DB check', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.requestCount).toBe('number');
    });

    it('should be accessible without authentication', async () => {
      await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);
    });
  });

  describe('POST /errors', () => {
    it('should accept frontend error reports', async () => {
      const response = await request(app.getHttpServer())
        .post('/errors')
        .send({
          message: 'Test error',
          stack: 'Error stack trace',
          url: '/test-page',
        })
        .expect(201);

      expect(response.body.received).toBe(true);
    });
  });

  describe('X-Response-Time header', () => {
    it('should include response time on all endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
    });
  });
});
