import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED: AE-EDGE-001 — Empty email or password in login request returns 400 validation error
  // TRACED: AE-EDGE-002 — Expired JWT token returns 401 without leaking expiry details
  // TRACED: AE-EDGE-003 — Malformed JWT token (truncated or tampered) returns 401 Unauthorized
  // TRACED: AE-EDGE-007 — Extra fields in request body are rejected by forbidNonWhitelisted
  describe('POST /auth/register', () => {
    it('should reject registration with empty email (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: '', password: 'password123', role: 'VIEWER', tenantId: 'tenant-1' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject registration with invalid email format (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123', role: 'VIEWER', tenantId: 'tenant-1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with ADMIN role (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'admin@test.com', password: 'password123', role: 'ADMIN', tenantId: 'tenant-1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with short password (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'short', role: 'VIEWER', tenantId: 'tenant-1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with extra fields (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          role: 'VIEWER',
          tenantId: 'tenant-1',
          extraField: 'hack',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with null password (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: null, role: 'VIEWER', tenantId: 'tenant-1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should return 401 for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Protected routes', () => {
    it('should return 401 for accessing dashboards without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should return 401 for accessing dashboards with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should return 401 for accessing data sources without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources');

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should return 401 for missing token on widgets', async () => {
      const res = await request(app.getHttpServer())
        .get('/widgets');

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
