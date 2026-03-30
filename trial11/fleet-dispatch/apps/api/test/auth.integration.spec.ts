import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

describe('Auth Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
  };

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reference BCRYPT_SALT_ROUNDS from shared', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
    expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@fleet.com',
        role: 'DISPATCHER',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@fleet.com',
          password: 'password123',
          role: 'DISPATCHER',
          tenantId: 'tenant-1',
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('test@fleet.com');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@fleet.com' },
      });
    });

    it('should return 409 for duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'existing@fleet.com',
          password: 'password123',
          role: 'DISPATCHER',
          tenantId: 'tenant-1',
        });

      expect(res.status).toBe(409);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'existing@fleet.com' },
      });
    });

    it('should reject ADMIN role registration', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@fleet.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject invalid or missing email', async () => {
      const missing = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          password: 'password123',
          role: 'DISPATCHER',
          tenantId: 'tenant-1',
        });

      expect(missing.status).toBe(400);
      expect(missing.body.message).toBeDefined();
    });

    it('should reject extra properties', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@fleet.com',
          password: 'password123',
          role: 'DISPATCHER',
          tenantId: 'tenant-1',
          isAdmin: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@fleet.com',
          password: 'wrong',
        });

      expect(res.status).toBe(401);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'wrong@fleet.com' },
      });
    });

    it('should reject missing password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@fleet.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });
});
