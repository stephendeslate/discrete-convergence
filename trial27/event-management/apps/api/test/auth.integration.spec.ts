// TRACED: EM-AUTH-001 — Auth integration tests
// These tests require a running database
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-app';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /auth/register — should register a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `user-${Date.now()}@test.com`,
        password: 'password123',
        tenantId: 'test-tenant',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('POST /auth/register — should reject duplicate email in same tenant', async () => {
    const email = `dup-${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', tenantId: 'dup-tenant' });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', tenantId: 'dup-tenant' });

    expect(res.status).toBe(409);
  });

  it('POST /auth/login — should login with valid credentials', async () => {
    const email = `login-${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', tenantId: 'login-tenant' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('POST /auth/login — should reject invalid password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('POST /auth/register — should reject malformed email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'password123', tenantId: 'tenant' });

    expect(res.status).toBe(400);
  });

  it('POST /auth/register — should reject short password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'short', tenantId: 'tenant' });

    expect(res.status).toBe(400);
  });

  it('POST /auth/register — should reject empty body', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({});

    expect(res.status).toBe(400);
  });
});
