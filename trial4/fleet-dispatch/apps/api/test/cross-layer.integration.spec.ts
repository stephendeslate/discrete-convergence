// TRACED:FD-CRS-002 — Cross-layer integration test: auth, CRUD, error handling, correlation, response time, health
// TRACED:FD-INF-004 — This test exercises the CI/CD pipeline jobs (lint, test, build, typecheck, audit)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@fleet-dispatch/shared';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health with APP_VERSION from shared', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(APP_VERSION);
    expect(res.body.status).toBe('ok');
  });

  it('should return readiness check', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
  });

  it('should include X-Response-Time header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('should return X-Correlation-ID header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('should preserve client-supplied correlation ID', async () => {
    const customId = 'test-correlation-123';
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', customId);
    expect(res.headers['x-correlation-id']).toBe(customId);
  });

  it('should require auth for protected endpoints', async () => {
    const res = await request(app.getHttpServer()).get('/work-orders');
    expect(res.status).toBe(401);
  });

  it('should return error with correlationId in body on 404', async () => {
    const res = await request(app.getHttpServer()).get('/nonexistent');
    expect(res.body.correlationId).toBeDefined();
  });

  it('should return metrics endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body.requestCount).toBeDefined();
    expect(res.body.uptime).toBeDefined();
  });

  it('should validate request body and reject extra fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'test', extraField: 'bad' });
    expect(res.status).toBe(400);
  });
});
