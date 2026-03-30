import * as request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Performance (supertest)', () => {
  const { getApp } = useTestApp();

  it('responses include X-Response-Time header', async () => {
    const res = await request(getApp().getHttpServer()).get('/health');
    expect(res.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
  });

  it('health endpoint responds quickly', async () => {
    const start = Date.now();
    await request(getApp().getHttpServer()).get('/health').expect(200);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
