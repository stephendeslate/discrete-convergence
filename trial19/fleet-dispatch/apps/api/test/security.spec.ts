import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Security Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp({ withSecurity: true });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include Content-Security-Policy header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('should not include X-Powered-By header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should return 401 for unauthenticated access to protected routes', async () => {
    const res = await request(app.getHttpServer()).get('/vehicles');
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('should return 401 for invalid Bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('should return 400 for non-whitelisted fields on register', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'VIEWER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        hackerField: 'malicious',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('should return 400 for SQL injection in login body', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: "admin' OR 1=1 --", password: 'pass' });
    expect(res.status).toBe(400);
    expect(res.body).toBeDefined();
  });

  it('should return safe response for XSS attempt in URL', async () => {
    const res = await request(app.getHttpServer())
      .get('/<script>alert(1)</script>');
    expect(res.status).toBe(404);
    expect(res.text).not.toContain('<script>');
  });

  it('should handle CORS preflight', async () => {
    const res = await request(app.getHttpServer())
      .options('/vehicles')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');
    expect(res.status).toBeLessThanOrEqual(204);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should enforce rate limiting on login endpoint', async () => {
    const responses = [];
    for (let i = 0; i < 15; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });
      responses.push(res.status);
    }
    expect(responses).toContain(429);
  });
});
