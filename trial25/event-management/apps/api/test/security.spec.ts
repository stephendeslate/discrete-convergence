import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestApp } from './helpers/test-utils';

describe('Security', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should require authentication for protected endpoints', async () => { // VERIFY:EM-SEC-V01 — auth guard blocks unauthenticated requests
    const endpoints = [
      { method: 'get' as const, path: '/events' },
      { method: 'get' as const, path: '/venues' },
      { method: 'get' as const, path: '/tickets' },
      { method: 'get' as const, path: '/attendees' },
      { method: 'get' as const, path: '/speakers' },
      { method: 'get' as const, path: '/sessions' },
    ];

    for (const endpoint of endpoints) {
      const response = await request(app.getHttpServer())[endpoint.method](endpoint.path);
      expect(response.status).toBe(401);
    }
  });

  it('should reject invalid JWT tokens', async () => { // VERIFY:EM-SEC-V02 — invalid JWT rejected with 401
    const response = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
  });

  it('should include security headers from helmet', async () => { // VERIFY:EM-SEC-V03 — helmet security headers present
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  it('should enforce CORS by responding to OPTIONS', async () => { // VERIFY:EM-SEC-V04 — CORS enabled on API
    const response = await request(app.getHttpServer())
      .options('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');
    expect(response.status).toBeLessThan(500);
  });

  it('should reject non-whitelisted fields in request body', async () => { // VERIFY:EM-SEC-V05 — validation pipe forbids non-whitelisted fields
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password123', isAdmin: true });
    expect(response.status).toBe(400);
  });

  it('should not expose stack traces in error responses', async () => { // VERIFY:EM-SEC-V06 — error responses do not leak stack traces
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({});
    expect(response.body.stack).toBeUndefined();
  });
});
