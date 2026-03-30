import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';
import { APP_VERSION } from '@fleet-dispatch/shared';

describe('Cross-Layer Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp({ withSecurity: true });
  });

  afterAll(async () => {
    await app.close();
  });

  it('health endpoint returns APP_VERSION from shared', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(APP_VERSION);
  });

  it('full pipeline: health -> response time -> correlation ID', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'cross-layer-test-1');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-correlation-id']).toBe('cross-layer-test-1');
    expect(res.body.status).toBe('ok');
  });

  it('auth guard blocks unauthenticated vehicle access', async () => {
    const res = await request(app.getHttpServer()).get('/vehicles');
    expect(res.status).toBe(401);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('auth guard blocks unauthenticated driver access', async () => {
    const res = await request(app.getHttpServer()).get('/drivers');
    expect(res.status).toBe(401);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('auth guard blocks unauthenticated dispatch access', async () => {
    const res = await request(app.getHttpServer()).get('/dispatches');
    expect(res.status).toBe(401);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('auth guard blocks unauthenticated route access', async () => {
    const res = await request(app.getHttpServer()).get('/routes');
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('CSP and security headers present on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('error responses include correlationId', async () => {
    const res = await request(app.getHttpServer()).get('/vehicles');
    expect(res.status).toBe(401);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('validation pipeline rejects malformed requests', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ invalid: true });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('health endpoint accessible without any auth', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
