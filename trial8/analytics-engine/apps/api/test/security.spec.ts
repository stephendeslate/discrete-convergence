import request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Security (supertest)', () => {
  const { getApp } = useTestApp({ validation: true });

  it('protected routes return 401 without auth token', async () => {
    const dashRes = await request(getApp().getHttpServer()).get('/dashboards');
    expect(dashRes.status).toBe(401);
    expect(dashRes.body).toHaveProperty('message');

    const dsRes = await request(getApp().getHttpServer()).get('/data-sources');
    expect(dsRes.status).toBe(401);

    const metricsRes = await request(getApp().getHttpServer()).get('/metrics');
    expect(metricsRes.status).toBe(401);
  });

  it('public routes are accessible without auth', async () => {
    const res = await request(getApp().getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('rejects requests with unknown properties via whitelist', async () => {
    const res = await request(getApp().getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'USER',
        tenantId: 'tid',
        malicious: 'payload',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('auth endpoints are publicly accessible without JWT', async () => {
    const loginRes = await request(getApp().getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrong' });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body).toHaveProperty('message');
  });
});
