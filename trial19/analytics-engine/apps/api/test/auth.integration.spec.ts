import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

describe('Auth Integration', () => {
  let app: INestApplication;
  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    dashboard: { findMany: jest.fn(), count: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      role: 'USER',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        tenantId: 'tenant-1',
        role: 'USER',
      });

    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
  });

  it('should reject registration with ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      });

    expect(res.status).toBe(400);
  });

  it('should return 409 for duplicate email registration', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Dup User',
        tenantId: 'tenant-1',
        role: 'USER',
      });

    expect(res.status).toBe(409);
  });

  it('should return 401 for invalid login credentials', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  it('should reject login with invalid email format', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('should reject registration with extra fields (forbidNonWhitelisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new@example.com',
        password: 'password123',
        name: 'Test',
        tenantId: 'tenant-1',
        role: 'USER',
        isAdmin: true,
      });

    expect(res.status).toBe(400);
  });

  it('should return 401 when accessing protected route without token', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');

    expect(res.status).toBe(401);
  });

  it('should return 401 when accessing protected route with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('should use BCRYPT_SALT_ROUNDS from shared package', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
    expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
  });
});
