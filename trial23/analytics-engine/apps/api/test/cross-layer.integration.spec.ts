import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, uniqueEmail } from './helpers/test-utils';

process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/analytics_test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-min-32-chars!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-min-32!!';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Full pipeline: register -> login -> create -> read -> delete', () => {
    it('should complete the full CRUD lifecycle through HTTP', async () => {
      const email = uniqueEmail();
      const password = 'FullPipeline123!';

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password, name: 'Pipeline User', role: 'viewer' });
      expect(registerRes.status).toBe(201);
      expect(registerRes.body.email).toBe(email);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });
      expect(loginRes.status).toBe(201);
      expect(loginRes.body).toHaveProperty('access_token');
      const token = loginRes.body.access_token;

      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Pipeline Dashboard' });
      expect(createRes.status).toBe(201);
      expect(createRes.body.name).toBe('Pipeline Dashboard');
      const dashboardId = createRes.body.id;

      const readRes = await request(app.getHttpServer())
        .get(`/dashboards/${dashboardId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(readRes.status).toBe(200);
      expect(readRes.body.id).toBe(dashboardId);

      const deleteRes = await request(app.getHttpServer())
        .delete(`/dashboards/${dashboardId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.id).toBe(dashboardId);

      const verifyRes = await request(app.getHttpServer())
        .get(`/dashboards/${dashboardId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(verifyRes.status).toBe(404);
    });
  });

  describe('Correlation ID propagation', () => {
    it('should echo back X-Correlation-ID on success responses', async () => {
      const correlationId = 'cross-layer-test-abc-123';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId);

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should include correlationId in error responses', async () => {
      const correlationId = 'error-correlation-456';
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('X-Correlation-ID', correlationId);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('correlationId');
      expect(res.headers['x-correlation-id']).toBe(correlationId);
    });
  });

  describe('Global exception filter', () => {
    it('should return structured error without stack traces on 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.stack).toBeUndefined();
      expect(res.body.trace).toBeUndefined();
    });

    it('should return structured error with correlationId on 404', async () => {
      const email = uniqueEmail();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Password123!', name: 'User', role: 'viewer' });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'Password123!' });
      const token = loginRes.body.access_token;

      const res = await request(app.getHttpServer())
        .get('/dashboards/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', 'err-corr-789');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('correlationId');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.stack).toBeUndefined();
    });
  });

  describe('Simultaneous headers', () => {
    it('should return auth, throttle, correlation ID, and response time headers together', async () => {
      const email = uniqueEmail();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Password123!', name: 'Header User', role: 'viewer' });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'Password123!' });
      const token = loginRes.body.access_token;

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', 'simul-headers-test');

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBe('simul-headers-test');
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['cache-control']).toBeDefined();
    });
  });
});
