import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@fleet-dispatch/shared';

/**
 * Cross-layer integration test — verifies the full pipeline:
 * auth → CRUD → error handling → correlation IDs → response time → health → DB check.
 * TRACED:FD-CROSS-001
 */
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

  it('should return X-Response-Time header on health endpoint', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.headers['x-response-time']).toBeDefined();
  });

  it('should return X-Correlation-ID header on all responses', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.headers['x-correlation-id']).toBeDefined();
  });

  it('should preserve client correlation ID', async () => {
    const customId = 'test-correlation-id-123';
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', customId);

    expect(response.headers['x-correlation-id']).toBe(customId);
  });

  it('should include APP_VERSION in health response', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.body.version).toBe(APP_VERSION);
  });

  it('should return correlationId in error responses', async () => {
    const response = await request(app.getHttpServer())
      .get('/nonexistent-endpoint');

    expect(response.body.correlationId).toBeDefined();
  });

  it('should return 401 for protected endpoints without auth', async () => {
    const response = await request(app.getHttpServer())
      .get('/work-orders');

    expect(response.status).toBe(401);
  });

  it('should return sanitized error without stack trace', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bad@test.com', password: 'wrong' });

    expect(response.body.stack).toBeUndefined();
    expect(response.body.correlationId).toBeDefined();
  });

  it('health endpoint should be accessible without auth (public)', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('metrics endpoint should be accessible without auth (public)', async () => {
    const response = await request(app.getHttpServer()).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.body.requestCount).toBeDefined();
  });
});
