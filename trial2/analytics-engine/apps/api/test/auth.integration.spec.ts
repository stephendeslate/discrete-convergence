import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED:AE-TEST-001 — Auth integration tests with supertest and real AppModule
describe('Auth Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reference BCRYPT_SALT_ROUNDS from shared', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'testpassword123',
          name: 'Test User',
          tenantName: 'Test Tenant',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject registration with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'testpassword123',
          name: 'Test User',
          tenantName: 'Test Tenant',
        })
        .expect(400);
    });

    it('should reject registration with ADMIN role', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `admin-${Date.now()}@example.com`,
          password: 'testpassword123',
          name: 'Admin User',
          tenantName: 'Admin Tenant',
          role: 'ADMIN',
        })
        .expect(400);
    });

    it('should reject registration with extra fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `extra-${Date.now()}@example.com`,
          password: 'testpassword123',
          name: 'Test',
          tenantName: 'Tenant',
          extraField: 'should-be-rejected',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const email = `login-${Date.now()}@example.com`;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'loginpassword123',
          name: 'Login User',
          tenantName: 'Login Tenant',
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'loginpassword123' })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'pass' })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `refresh-${Date.now()}@example.com`,
          password: 'refreshpass123',
          name: 'Refresh User',
          tenantName: 'Refresh Tenant',
        });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: registerRes.body.refreshToken })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });
});
