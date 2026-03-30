// TRACED:AE-CROSS-001 — cross-layer integration test
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@analytics-engine/shared';

describe('Cross-Layer Integration', () => {
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

  it('full pipeline: auth -> CRUD -> error handling -> correlation IDs -> response time -> health', async () => {
    // Register and get token
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'cross-layer@example.com',
        password: 'securepass123',
        tenantName: 'Cross Layer Tenant',
        role: 'USER',
      })
      .expect(201);

    const token = registerRes.body.accessToken;
    expect(token).toBeDefined();

    // Create dashboard (CRUD)
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Correlation-ID', 'test-corr-123')
      .send({ title: 'Cross Layer Dashboard' })
      .expect(201);

    expect(createRes.body.title).toBe('Cross Layer Dashboard');

    // Verify correlation ID propagation
    expect(createRes.headers['x-correlation-id']).toBe('test-corr-123');

    // Verify response time header
    expect(createRes.headers['x-response-time']).toBeDefined();

    // Health check with version
    const healthRes = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(healthRes.body.version).toBe(APP_VERSION);
    expect(healthRes.body.status).toBe('ok');

    // Error handling: unauthenticated access
    const errorRes = await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);

    expect(errorRes.body.statusCode).toBe(401);
    expect(errorRes.body.correlationId).toBeDefined();

    // DB readiness check
    const readyRes = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(readyRes.body.status).toBeDefined();
  });

  it('should include CSP headers on all responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('should return X-Response-Time on error responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);

    expect(res.headers['x-response-time']).toBeDefined();
  });
});
