// TRACED:EM-TEST-001 — auth integration tests with supertest + real AppModule
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env['JWT_SECRET'] = 'test-jwt-secret-for-integration';
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env['CORS_ORIGIN'] = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /auth/login', () => {
    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});
      expect([400, 401]).toContain(res.status);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('POST /auth/register', () => {
    it('should reject registration with ADMIN role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
          organizationId: '00000000-0000-0000-0000-000000000000',
        });
      expect([400, 409]).toContain(res.status);
    });

    it('should reject registration without required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject invalid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });
      expect(res.status).toBe(401);
    });
  });
});
