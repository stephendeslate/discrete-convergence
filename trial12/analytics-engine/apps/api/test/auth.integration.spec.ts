import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

describe('Auth Integration', () => {
  let app: INestApplication;
  let _prisma: PrismaService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    dashboard: { findMany: jest.fn(), count: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn() },
    queryExecution: { findMany: jest.fn(), count: jest.fn() },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
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
    _prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      tenantId: 'tenant-1',
    };
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ ...mockUser, password: 'hashed' });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'USER',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
  });

  it('should reject registration with ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('should reject registration with missing email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        password: 'password123',
        name: 'Test',
        role: 'USER',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('should login with valid credentials', async () => {
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: hashed,
      role: 'USER',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
  });

  it('should reject login with invalid credentials', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should reject login with wrong password', async () => {
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash('correct-password', BCRYPT_SALT_ROUNDS);
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      password: hashed,
      role: 'USER',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrong-password',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should reject login with missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('should reject registration with duplicate email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'existing-user',
      email: 'existing@example.com',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Duplicate',
        role: 'USER',
        tenantId: 'tenant-1',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });
});
