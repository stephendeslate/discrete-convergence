// TRACED:AE-CROSS-003 — Cross-layer integration test verifying full pipeline
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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

  it('health endpoint is public and returns version', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('protected endpoints return 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);
  });

  it('response includes correlation ID header', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'test-correlation-123');

    expect(res.headers['x-correlation-id']).toBe('test-correlation-123');
  });

  it('response includes X-Response-Time header', async () => {
    const res = await request(app.getHttpServer())
      .get('/health');

    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('auth endpoints are publicly accessible', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('error responses include correlationId', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('X-Correlation-ID', 'error-test-456');

    expect(res.body).toHaveProperty('correlationId');
  });
});
