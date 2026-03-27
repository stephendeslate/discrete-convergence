// TRACED: EM-MON-001 — Cross-layer integration tests
// TRACED: EM-MON-002 — Correlation ID tests
// TRACED: EM-SEC-001 — Authentication guard tests
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Cross-Layer Integration (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await getAuthToken(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /health — should return ok without auth', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /health — should include version', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.body).toHaveProperty('version');
  });

  it('GET /health/ready — should return database status', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('database');
  });

  it('GET /events — should return 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/events');
    expect(res.status).toBe(401);
  });

  it('GET /venues — should return 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/venues');
    expect(res.status).toBe(401);
  });

  it('GET /metrics — should return 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(401);
  });

  it('GET /metrics — should restrict to ADMIN role', async () => {
    // Registered users have MEMBER role, so metrics should be forbidden
    const res = await request(app.getHttpServer())
      .get('/metrics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('should propagate correlation ID from request header', async () => {
    const correlationId = 'test-correlation-123';
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('x-correlation-id', correlationId);

    expect(res.headers['x-correlation-id']).toBe(correlationId);
  });

  it('should generate correlation ID if not provided', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('GET /events — should return events list with auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /venues — should return venues list with auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/venues')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('full auth flow — register, login, access protected resource', async () => {
    const email = `flow-${Date.now()}@test.com`;

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', tenantId: 'flow-tenant' });

    expect([200, 201]).toContain(registerRes.status);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });

    expect([200, 201]).toContain(loginRes.status);

    const eventsRes = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    expect(eventsRes.status).toBe(200);
  });

  it('POST /auth/register — should reject extra fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'extra@test.com',
        password: 'password123',
        tenantId: 'tenant',
        extraField: 'bad',
      });

    expect(res.status).toBe(400);
  });

  it('POST /events — should reject invalid body without auth', async () => {
    const res = await request(app.getHttpServer())
      .post('/events')
      .send({ name: 'test' });

    expect(res.status).toBe(401);
  });
});
