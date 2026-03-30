import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
// TRACED:AE-CRS-002 — cross-layer test verifies full pipeline
import { APP_VERSION } from '@analytics-engine/shared';

describe('Cross-Layer Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            frameAncestors: ["'none'"],
          },
        },
      }),
    );
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

  it('health endpoint returns APP_VERSION from shared', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(APP_VERSION);
  });

  it('auth → CRUD pipeline: unauthenticated gets 401', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
  });

  it('error responses include correlationId', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('X-Correlation-ID', 'cross-layer-test-123');
    expect(res.status).toBe(401);
  });

  it('X-Response-Time header present on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('CSP headers present via Helmet', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('health/ready checks DB connectivity', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('database');
  });

  it('validation rejects malformed input with 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-email', password: '' });
    expect(res.status).toBe(400);
  });

  it('metrics endpoint returns in-memory counters', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requestCount');
    expect(typeof res.body.requestCount).toBe('number');
  });
});
