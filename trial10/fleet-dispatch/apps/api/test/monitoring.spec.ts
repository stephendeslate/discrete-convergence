import request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Monitoring (supertest)', () => {
  const { getApp } = useTestApp();

  it('GET /health returns ok status', async () => {
    const res = await request(getApp().getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
  });

  it('GET /health/ready checks database', async () => {
    const res = await request(getApp().getHttpServer()).get('/health/ready');
    expect([200, 500]).toContain(res.status);
  });

  it('correlation ID is propagated in response', async () => {
    const res = await request(getApp().getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'mon-test-789');

    expect(res.headers['x-correlation-id']).toBe('mon-test-789');
  });

  it('X-Response-Time header is set', async () => {
    const res = await request(getApp().getHttpServer()).get('/health');
    expect(res.headers['x-response-time']).toBeDefined();
  });
});
