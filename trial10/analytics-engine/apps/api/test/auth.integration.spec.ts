import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import { NoopThrottlerGuard } from './helpers/test-utils';

// TRACED: AE-AUTH-008
describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440099',
    email: 'test@test.com',
    passwordHash: '$2a$12$hash',
    name: 'Test User',
    role: 'USER',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ThrottlerGuard)
      .useClass(NoopThrottlerGuard)
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          count: jest.fn(),
        },
        dashboard: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $executeRaw: jest.fn().mockResolvedValue(1),
      })
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

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@test.com',
          password: 'password123',
          name: 'New User',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          name: 'Admin',
          role: 'ADMIN',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject registration with duplicate email', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already registered');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
    });

    it('should reject registration with extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordHash: hash,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
    });

    it('should reject login with wrong password', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordHash: hash,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-email', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return profile for authenticated user', async () => {
      const token = await jwtService.signAsync({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      });

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(mockUser.email);
      expect(response.body.tenantId).toBe(mockUser.tenantId);
    });

    it('should reject profile access without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });

    it('should reject profile access with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });

    it('should reject profile access with expired token', async () => {
      const token = await jwtService.signAsync(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          tenantId: mockUser.tenantId,
        },
        { expiresIn: '0s' },
      );

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });
  });
});
