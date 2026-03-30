import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TestApp } from './helpers/test-app';

// TRACED: AE-AUTH-001 — Registration with valid data
// TRACED: AE-AUTH-002 — Registration with duplicate email
// TRACED: AE-AUTH-003 — Login with valid credentials
// TRACED: AE-AUTH-004 — Login with invalid password
// TRACED: AE-EDGE-006 — Login with malformed email
// TRACED: AE-EDGE-007 — Registration with empty name

describe('Auth Integration', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `test-${Date.now()}@example.com`, password: 'password123', name: 'Test User', tenantName: 'TestCo' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
  });

  it('POST /auth/register should return conflict for duplicate email', async () => {
    const email = `dup-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'User 1', tenantName: 'Co1' });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'User 2', tenantName: 'Co2' });

    expect(res.status).toBe(409);
  });

  it('POST /auth/login should return token for valid credentials', async () => {
    const email = `login-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'Login User', tenantName: 'Co' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
  });

  it('POST /auth/login should return unauthorized for invalid password', async () => {
    const email = `wrong-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'Wrong Pwd', tenantName: 'Co' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('POST /auth/login should return unauthorized for non-existent user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('POST /auth/register should reject malformed email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'password123', name: 'User', tenantName: 'Co' });

    expect(res.status).toBe(400);
  });

  it('POST /auth/register should reject empty name', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'valid@example.com', password: 'password123', name: '', tenantName: 'Co' });

    expect(res.status).toBe(400);
  });
});
