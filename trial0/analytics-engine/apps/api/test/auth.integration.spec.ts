// TRACED:AE-TEST-001 — Auth integration tests with supertest + real AppModule
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'SecurePass123!',
          name: 'Test User',
          role: 'USER',
          tenantId: 'test-tenant-id',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should reject registration with ADMIN role', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin-attempt@example.com',
          password: 'SecurePass123!',
          name: 'Admin Attempt',
          role: 'ADMIN',
          tenantId: 'test-tenant-id',
        })
        .expect(400);
    });

    it('should reject registration with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'incomplete@example.com',
        })
        .expect(400);
    });

    it('should reject registration with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'SecurePass123!',
          name: 'Test User',
          role: 'USER',
          tenantId: 'test-tenant-id',
        })
        .expect(400);
    });

    it('should reject registration with extra fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'extra@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
          role: 'USER',
          tenantId: 'test-tenant-id',
          isAdmin: true,
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPass123!',
        })
        .expect(401);
    });

    it('should reject login with missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject refresh without auth token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);
    });
  });

  it('should confirm BCRYPT_SALT_ROUNDS is imported from shared', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });
});
