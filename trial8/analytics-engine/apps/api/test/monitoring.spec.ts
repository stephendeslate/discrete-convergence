import request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Monitoring (supertest)', () => {
  const { getApp } = useTestApp();

  it('GET /health returns ok status with version', async () => {
    const res = await request(getApp().getHttpServer()).get('/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /health/ready checks database connectivity', async () => {
    const res = await request(getApp().getHttpServer()).get('/health/ready');

    expect([200, 500]).toContain(res.status);
    // When DB is available: { status: 'ok', database: 'connected' }
    // When DB is unavailable: { statusCode: 500, message: ... }
    expect(res.body).toHaveProperty(res.status === 200 ? 'status' : 'statusCode');
    expect(res.body).toHaveProperty(res.status === 200 ? 'database' : 'message');
  });

  it('correlation ID is propagated in response headers', async () => {
    const res = await request(getApp().getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'mon-test-789');

    expect(res.headers['x-correlation-id']).toBe('mon-test-789');
    expect(res.status).toBe(200);
  });

  it('X-Response-Time header is set on all responses', async () => {
    const res = await request(getApp().getHttpServer()).get('/health');

    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.status).toBe(200);
  });
});
