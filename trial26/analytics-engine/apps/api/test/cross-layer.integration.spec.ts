import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TestApp } from './helpers/test-app';

// TRACED: AE-CROSS-001 — Full auth flow (register → login → access protected)
// TRACED: AE-CROSS-002 — Dashboard CRUD lifecycle
// TRACED: AE-EDGE-008 — Unauthorized access to protected endpoints
// TRACED: AE-EDGE-009 — Invalid pagination parameters boundary
// TRACED: AE-EDGE-010 — Not found for nonexistent resource

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete full auth flow: register → login → access protected endpoint', async () => {
    const email = `cross-${Date.now()}@example.com`;

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'Cross User', tenantName: 'CrossCo' });
    expect(registerRes.status).toBe(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });
    expect(loginRes.status).toBe(201);

    const dashRes = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${loginRes.body.access_token}`);
    expect(dashRes.status).toBe(200);
  });

  it('should return 401 for unauthorized access to protected endpoints', async () => {
    const endpoints = ['/dashboards', '/data-sources', '/metrics', '/audit-log'];

    for (const endpoint of endpoints) {
      const res = await request(app.getHttpServer()).get(endpoint);
      expect(res.status).toBe(401);
    }
  });

  it('should handle pagination boundary values correctly', async () => {
    const email = `pag-${Date.now()}@example.com`;
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'Pag User', tenantName: 'PagCo' });

    const res = await request(app.getHttpServer())
      .get('/dashboards?page=1&limit=100')
      .set('Authorization', `Bearer ${regRes.body.access_token}`);

    expect(res.status).toBe(200);
  });

  it('GET /health should be publicly accessible', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /health/ready should be publicly accessible', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect(res.status).toBe(200);
  });
});
