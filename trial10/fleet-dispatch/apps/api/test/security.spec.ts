import request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Security (supertest)', () => {
  const { getApp } = useTestApp();

  it('protected routes return 401 without auth', async () => {
    await request(getApp().getHttpServer()).get('/vehicles').expect(401);
    await request(getApp().getHttpServer()).get('/drivers').expect(401);
    await request(getApp().getHttpServer()).get('/dispatches').expect(401);
    await request(getApp().getHttpServer()).get('/metrics').expect(401);
  });

  it('public routes are accessible without auth', async () => {
    await request(getApp().getHttpServer()).get('/health').expect(200);
  });

  it('rejects requests with unknown properties', async () => {
    const res = await request(getApp().getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        tenantId: 'tid',
        malicious: 'payload',
      });
    expect(res.status).toBe(400);
  });

  it('rejects invalid role in registration', async () => {
    const res = await request(getApp().getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'ADMIN',
        tenantId: 'tid',
      });
    expect(res.status).toBe(400);
  });
});
