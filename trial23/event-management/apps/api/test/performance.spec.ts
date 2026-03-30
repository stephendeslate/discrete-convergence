process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://testuser:testpass@localhost:5433/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, uniqueEmail } from './helpers/test-utils';

describe('Performance', () => {
  let app: INestApplication;
  let tokens: { access_token: string; refresh_token: string };

  beforeAll(async () => {
    app = await createTestApp();
    tokens = await registerAndLogin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health should respond under 100ms', async () => {
    const start = Date.now();
    await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });

  it('GET /events should respond under 200ms', async () => {
    const start = Date.now();
    await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer ' + tokens.access_token)
      .expect(200);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(200);
  });

  it('POST /auth/login should respond under 500ms', async () => {
    const email = uniqueEmail();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'StrongPass123!', name: 'Perf User', role: 'ORGANIZER' })
      .expect(201);

    const start = Date.now();
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'StrongPass123!' })
      .expect(201);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(500);
  });

  it('pagination limits should work correctly', async () => {
    const res = await request(app.getHttpServer())
      .get('/events?page=1&limit=2')
      .set('Authorization', 'Bearer ' + tokens.access_token)
      .expect(200);

    expect(res.body.limit).toBe(2);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });

  it('X-Response-Time header should be present', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
  });

  it('multiple concurrent requests should succeed', async () => {
    const requests = Array.from({ length: 5 }, () =>
      request(app.getHttpServer())
        .get('/health')
        .then((res) => res.status),
    );

    const statuses = await Promise.all(requests);
    statuses.forEach((status) => {
      expect(status).toBe(200);
    });
  });

  it('response times should be reasonable under light load', async () => {
    const times: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
      times.push(Date.now() - start);
    }

    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    expect(avgTime).toBeLessThan(100);
  });
});
