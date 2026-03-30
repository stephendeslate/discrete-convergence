import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService } from './helpers/mock-prisma';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

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

  it('POST /auth/register should reject missing email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ password: 'test123', name: 'Test', tenantId: 'abc', role: 'VIEWER' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register should reject invalid role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'test123',
        name: 'Test',
        tenantId: 'abc',
        role: 'ADMIN',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/login should reject missing password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/login should return 401 for invalid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register should reject overly long email', async () => {
    const longEmail = 'a'.repeat(300) + '@test.com';
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: longEmail,
        password: 'test123',
        name: 'Test',
        tenantId: 'abc',
        role: 'VIEWER',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register should reject forbidden fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'test123',
        name: 'Test',
        tenantId: 'abc',
        role: 'VIEWER',
        isAdmin: true,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});
