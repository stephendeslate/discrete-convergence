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
    }).overrideProvider(PrismaService).useValue(mockPrismaService).compile();

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

  it('POST /auth/register should reject invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invalid', password: 'password123', tenantId: 'tenant-1', role: 'VIEWER' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('POST /auth/register should reject short password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'short', tenantId: 'tenant-1', role: 'VIEWER' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('POST /auth/register should reject ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'password123', tenantId: 'tenant-1', role: 'ADMIN' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('POST /auth/login should return 401 for invalid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('POST /auth/login should reject missing email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('POST /auth/login should reject missing password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('POST /auth/register should reject extra fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password123', tenantId: 'tenant-1', role: 'VIEWER', extraField: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });
});
