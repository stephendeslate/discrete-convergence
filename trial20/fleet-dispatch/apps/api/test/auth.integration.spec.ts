import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

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
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    $on: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh';
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: '1', email: 'new@test.com', role: 'VIEWER', tenantId: 't1',
    });
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'new@test.com', password: 'password123', role: 'VIEWER', tenantId: 't1' })
      .expect(201);
    expect(res.body.access_token).toBeDefined();
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should return 400 for invalid registration', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-email' })
      .expect(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 400 for ADMIN role registration', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'password123', role: 'ADMIN', tenantId: 't1' })
      .expect(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 409 for duplicate email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: '1', email: 'dup@test.com' });
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', role: 'VIEWER', tenantId: 't1' })
      .expect(409);
    expect(res.body.statusCode).toBe(409);
  });

  it('should return 401 for invalid login credentials', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bad@test.com', password: 'wrong' })
      .expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for missing token on protected route', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for invalid token on protected route', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should reject registration with extra fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'VIEWER',
        tenantId: 't1',
        extraField: 'should-fail',
      })
      .expect(400);
    expect(res.body.statusCode).toBe(400);
  });
});
