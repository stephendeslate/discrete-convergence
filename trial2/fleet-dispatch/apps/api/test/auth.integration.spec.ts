import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import * as bcrypt from 'bcrypt';

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

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject non-email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should return 400 for missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject ADMIN role during registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'Admin',
          companyId: '00000000-0000-0000-0000-000000000000',
          role: 'ADMIN',
        });

      expect(response.status).toBe(400);
    });

    it('should reject unknown properties (forbidNonWhitelisted)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          companyId: '00000000-0000-0000-0000-000000000000',
          role: 'DISPATCHER',
          unknownField: 'should-fail',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh');

      expect(response.status).toBe(401);
    });
  });

  it('should use BCRYPT_SALT_ROUNDS from shared package', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });
});
