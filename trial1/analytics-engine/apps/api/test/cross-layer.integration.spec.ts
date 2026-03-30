// TRACED:AE-CROSS-003 — Cross-layer integration test verifying full pipeline
import * as request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Cross-Layer Integration', () => {
  const { getApp } = useTestApp({ validation: true });

  it('health endpoint is public and returns version', async () => {
    const res = await request(getApp().getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('protected endpoints return 401 without token', async () => {
    await request(getApp().getHttpServer())
      .get('/dashboards')
      .expect(401);
  });

  it('response includes correlation ID header', async () => {
    const res = await request(getApp().getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'test-correlation-123');

    expect(res.headers['x-correlation-id']).toBe('test-correlation-123');
  });

  it('response includes X-Response-Time header', async () => {
    const res = await request(getApp().getHttpServer())
      .get('/health');

    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('auth endpoints are publicly accessible', async () => {
    const res = await request(getApp().getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('error responses include correlationId', async () => {
    const res = await request(getApp().getHttpServer())
      .get('/dashboards')
      .set('X-Correlation-ID', 'error-test-456');

    expect(res.body).toHaveProperty('correlationId');
  });
});
