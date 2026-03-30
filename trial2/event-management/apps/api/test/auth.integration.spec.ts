import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

// TRACED:EM-TEST-001 — Auth integration tests with supertest

describe('Auth Integration (e2e)', () => {
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

  it('should use BCRYPT_SALT_ROUNDS from shared', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  describe('POST /auth/login', () => {
    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('should reject missing password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should reject ADMIN role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
          organizationId: '00000000-0000-0000-0000-000000000000',
          role: 'ADMIN',
        });
      expect(res.status).toBe(400);
    });

    it('should reject non-whitelisted fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
          organizationId: '00000000-0000-0000-0000-000000000000',
          role: 'ATTENDEE',
          isAdmin: true,
        });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject missing token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should reject invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ token: 'invalid-jwt-token' });
      expect(res.status).toBe(401);
    });
  });
});
