import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED:AE-TEST-003 — Cross-layer integration test verifying full pipeline
describe('Cross-Layer Integration', () => {
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

  it('should complete full pipeline: register → create dashboard → error handling', async () => {
    // Step 1: Register
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `cross-${Date.now()}@example.com`,
        password: 'crosspass123',
        name: 'Cross User',
        tenantName: 'Cross Tenant',
      })
      .expect(201);

    const token = registerRes.body.accessToken;
    expect(token).toBeDefined();

    // Step 2: Create dashboard
    const dashRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Cross-Layer Dashboard' })
      .expect(201);

    expect(dashRes.body.id).toBeDefined();

    // Step 3: Get dashboard (verify X-Response-Time header)
    const getRes = await request(app.getHttpServer())
      .get(`/dashboards/${dashRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.headers['x-response-time']).toBeDefined();

    // Step 4: Verify correlation ID propagation
    const healthRes = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'test-correlation-123')
      .expect(200);

    expect(healthRes.headers['x-correlation-id']).toBe('test-correlation-123');

    // Step 5: Error handling — 404 with correlationId in response body
    const errorRes = await request(app.getHttpServer())
      .get('/dashboards/non-existent-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(errorRes.body).toHaveProperty('correlationId');
    expect(errorRes.body).toHaveProperty('statusCode', 404);
  });

  it('should return APP_VERSION in health endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.body.version).toBe(APP_VERSION);
  });

  it('should return X-Response-Time on all responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
  });

  it('should require auth on protected routes', async () => {
    await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);
  });

  it('should allow public routes without auth', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    await request(app.getHttpServer())
      .get('/metrics')
      .expect(200);
  });
});
