import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import * as bcrypt from 'bcryptjs';

describe('Auth Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = createMockPrismaService();
  const tenantId = 'test-tenant-001';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TRACED: FD-AUTH-010
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@fleet.test',
        name: 'Test User',
        role: 'DRIVER',
        tenantId,
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@fleet.test',
          password: 'password123',
          name: 'Test User',
          role: 'DRIVER',
          tenantId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@fleet.test' },
      });
    });

    it('should reject registration with existing email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'existing@fleet.test',
          password: 'password123',
          name: 'Test User',
          role: 'DRIVER',
          tenantId,
        })
        .expect(409);

      expect(res.body.message).toBe('Email already registered');
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject registration with invalid role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@fleet.test',
          password: 'password123',
          name: 'Test User',
          role: 'ADMIN',
          tenantId,
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject registration with missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          password: 'password123',
          name: 'Test User',
          role: 'DRIVER',
          tenantId,
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@fleet.test',
        name: 'Test User',
        role: 'DRIVER',
        tenantId,
        password: hashedPassword,
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@fleet.test', password: 'password123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@fleet.test' },
      });
    });

    it('should reject login with invalid email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@fleet.test', password: 'password123' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'wrong@fleet.test' },
      });
    });

    it('should reject login with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@fleet.test',
        password: hashedPassword,
        role: 'DRIVER',
        tenantId,
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@fleet.test', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /auth/profile', () => {
    it('should return profile for authenticated user', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@fleet.test',
        role: 'DRIVER',
        tenantId,
      });

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.email).toBe('test@fleet.test');
      expect(res.body.tenantId).toBe(tenantId);
    });

    it('should reject unauthenticated access', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should reject expired token', async () => {
      const token = jwtService.sign(
        { sub: 'user-1', email: 'test@fleet.test', role: 'DRIVER', tenantId },
        { expiresIn: '0s' },
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('GET /auth/admin/users', () => {
    it('should allow admin access', async () => {
      const token = jwtService.sign({
        sub: 'admin-1',
        email: 'admin@fleet.test',
        role: 'ADMIN',
        tenantId,
      });

      const res = await request(app.getHttpServer())
        .get('/auth/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe('Admin access granted');
      expect(res.body.tenantId).toBe(tenantId);
    });

    it('should reject non-admin access', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@fleet.test',
        role: 'DRIVER',
        tenantId,
      });

      const res = await request(app.getHttpServer())
        .get('/auth/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });
  });
});
