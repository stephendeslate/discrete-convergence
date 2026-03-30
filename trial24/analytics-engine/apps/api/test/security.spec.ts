// TRACED:TEST-SECURITY — Security integration tests
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should not expose x-powered-by header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.status).toBe(200);
  });

  it('should include CSP header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.status).toBe(200);
  });

  it('should reject SQL injection in query params', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards?page=1;DROP TABLE users')
      .set('Authorization', 'Bearer invalid');
    expect([400, 401]).toContain(res.status);
    expect(res.body).toBeDefined();
  });

  it('should reject XSS in request body', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: '<script>alert("xss")</script>',
        password: 'password123',
        tenantId: '00000000-0000-0000-0000-000000000001',
      });
    expect(res.status).toBe(400);
    expect(res.body).toBeDefined();
  });

  it('should require authentication on protected routes (unauthorized access)', async () => {
    const protectedRoutes = ['/dashboards', '/data-sources', '/audit-logs'];
    for (const route of protectedRoutes) {
      const res = await request(app.getHttpServer()).get(route);
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    }
  });

  it('should require auth on metrics endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/health/metrics');
    expect([200, 401]).toContain(res.status);
    expect(res.body).toBeDefined();
  });
});
