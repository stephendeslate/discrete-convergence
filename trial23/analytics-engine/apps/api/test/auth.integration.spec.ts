import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, uniqueEmail, registerAndLogin } from './helpers/test-utils';

process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/analytics_test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-min-32-chars!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-min-32!!';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const email = uniqueEmail();
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Password123!', name: 'Test User', role: 'viewer' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(email);
      expect(res.body.name).toBe('Test User');
      expect(res.body.role).toBe('viewer');
    });

    it('should return 409 for duplicate email', async () => {
      const email = uniqueEmail();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Password123!', name: 'User One', role: 'viewer' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Password456!', name: 'User Two', role: 'viewer' });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it('should return 403 for disallowed role (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: uniqueEmail(), password: 'Password123!', name: 'Admin User', role: 'admin' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('statusCode', 403);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: uniqueEmail() });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'Password123!', name: 'Test', role: 'viewer' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for forbidNonWhitelisted extra field', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail(),
          password: 'Password123!',
          name: 'Test',
          role: 'viewer',
          hackerField: 'malicious',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully and return tokens', async () => {
      const email = uniqueEmail();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Password123!', name: 'Login User', role: 'viewer' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'Password123!' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should return 401 for wrong password', async () => {
      const email = uniqueEmail();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'Password123!', name: 'User', role: 'viewer' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should return 401 for nonexistent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@nowhere.com', password: 'Password123!' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const tokens = await registerAndLogin(app);

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: tokens.refresh_token });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(res.body.access_token).not.toBe(tokens.access_token);
    });

    it('should return 401 for invalid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid.token.here' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('Missing auth header', () => {
    it('should return 401 when accessing protected endpoint without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });
  });
});
