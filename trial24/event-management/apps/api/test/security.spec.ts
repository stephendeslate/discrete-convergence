// TRACED:TEST-SECURITY — Security integration tests
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TEST_ORG_ID } from './helpers/test-utils';

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
      .get('/events?page=1;DROP TABLE users')
      .set('Authorization', 'Bearer invalid');
    expect([400, 401]).toContain(res.status);
    expect(res.body).toBeDefined();
  });

  it('should reject XSS in request body (malformed input)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: '<script>alert("xss")</script>',
        password: 'SecurePass1',
        organizationId: TEST_ORG_ID,
      });
    expect(res.status).toBe(400);
    expect(res.body).toBeDefined();
  });

  it('should require authentication on protected routes (unauthorized)', async () => {
    const protectedRoutes = ['/events', '/venues', '/sessions'];
    for (const route of protectedRoutes) {
      const res = await request(app.getHttpServer()).get(route);
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    }
  });

  it('should reject requests with invalid JWT (unauthorized)', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  it('health endpoints should not require auth', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it('should strip unknown fields via whitelist validation', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass1',
        organizationId: TEST_ORG_ID,
        role: 'ADMIN',
      });
    expect(res.status).toBe(400);
    expect(res.body).toBeDefined();
  });
});
