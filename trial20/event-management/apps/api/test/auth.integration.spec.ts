import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

describe('Auth Integration', () => {
  let app: INestApplication;
  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $on: jest.fn(),
    $executeRaw: jest.fn(),
    event: { findMany: jest.fn(), count: jest.fn() },
    venue: { findMany: jest.fn(), count: jest.fn() },
    attendee: { findMany: jest.fn(), count: jest.fn() },
    registration: { findMany: jest.fn(), count: jest.fn() },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should register a new user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@test.com',
      role: 'VIEWER',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new@test.com',
        password: 'password123',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(400);
  });

  it('should reject registration with ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(400);
  });

  it('should reject login with missing credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 401 for invalid credentials', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('should return 401 for requests without token', async () => {
    const res = await request(app.getHttpServer()).get('/events');

    expect(res.status).toBe(401);
  });

  it('should return 401 for requests with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('should reject registration with extra fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'VIEWER',
        tenantId: 'tenant-1',
        extraField: 'should-be-rejected',
      });

    expect(res.status).toBe(400);
  });

  it('should reject registration with duplicate email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'existing@test.com',
        password: 'password123',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(409);
  });

  it('should reject registration with short password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'short',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(400);
  });
});
