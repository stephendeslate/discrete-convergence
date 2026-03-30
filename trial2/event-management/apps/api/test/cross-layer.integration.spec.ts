import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@event-management/shared';

// TRACED:EM-TEST-003 — Cross-layer integration tests verifying full pipeline
// TRACED:EM-INFRA-002 — CI pipeline with lint, test, build, typecheck, migration-check, audit

describe('Cross-Layer Integration (e2e)', () => {
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

  describe('Health Pipeline', () => {
    it('should return health status with APP_VERSION from shared', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.version).toBe(APP_VERSION);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('Correlation ID Pipeline', () => {
    it('should return correlation ID header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('should preserve client-provided correlation ID', async () => {
      const correlationId = 'test-correlation-123';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId);
      expect(res.headers['x-correlation-id']).toBe(correlationId);
    });
  });

  describe('Response Time Pipeline', () => {
    it('should include X-Response-Time header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Error Handling Pipeline', () => {
    it('should return correlation ID in error response body', async () => {
      const correlationId = 'error-test-123';
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('X-Correlation-ID', correlationId);
      expect(res.status).toBe(401);
      expect(res.body.correlationId).toBe(correlationId);
    });

    it('should not leak stack traces', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.body).not.toHaveProperty('stack');
    });
  });

  describe('Auth Guard Pipeline', () => {
    it('should allow public routes without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
    });

    it('should reject protected routes without auth', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.status).toBe(401);
    });
  });

  describe('Validation Pipeline', () => {
    it('should reject invalid request bodies', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ invalidField: 'value' });
      expect(res.status).toBe(400);
    });
  });
});
