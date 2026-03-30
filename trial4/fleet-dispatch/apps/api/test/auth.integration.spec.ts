// TRACED:FD-AUT-005 — Auth integration tests with real AppModule
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

describe('Auth Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should use shared BCRYPT_SALT_ROUNDS constant', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should reject registration with ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'hacker@test.com', password: 'pass1234', role: 'ADMIN' });
    expect(res.status).toBe(400);
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'pass1234', role: 'DISPATCHER' });
    expect(res.status).toBe(400);
  });

  it('should reject login with missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  it('should reject login with wrong credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('confirms PrismaService is injectable', () => {
    expect(prisma).toBeDefined();
  });
});
