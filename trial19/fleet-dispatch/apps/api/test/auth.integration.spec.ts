import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login — should return 401 for invalid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/login — should return 400 for missing email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/login — should return 400 for empty body', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register — should return 400 for missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register — should return 400 for invalid role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'ADMIN',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register — should reject extra fields (forbidNonWhitelisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'VIEWER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        isAdmin: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('GET /vehicles — should return 401 without auth token', async () => {
    const res = await request(app.getHttpServer()).get('/vehicles');

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('GET /drivers — should return 401 with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/drivers')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('GET /dispatches — should return 401 with expired-style token', async () => {
    const res = await request(app.getHttpServer())
      .get('/dispatches')
      .set('Authorization', 'Bearer expired.token.value');

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });
});
