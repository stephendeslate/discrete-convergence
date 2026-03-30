import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';
import type { Server } from 'http';

describe('Auth Integration', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: {
    user: { findFirst: jest.Mock; create: jest.Mock };
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $queryRaw: jest.Mock;
    $executeRaw: jest.Mock;
    onModuleInit: jest.Mock;
    onModuleDestroy: jest.Mock;
  };

  beforeAll(async () => {
    prisma = {
      user: { findFirst: jest.fn(), create: jest.fn() },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      $executeRaw: jest.fn(),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
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
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@example.com',
        role: 'USER',
      });

      const response = await request(server)
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          role: 'USER',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('new@example.com');
    });

    it('should reject duplicate email registration', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      const response = await request(server)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Dup User',
          role: 'USER',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already registered');
    });

    it('should reject ADMIN role registration', async () => {
      const response = await request(server)
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          name: 'Admin',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        });

      // ValidationPipe rejects ADMIN via @IsIn constraint before service runs
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      const response = await request(server)
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'User',
          role: 'USER',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject missing required fields', async () => {
      const response = await request(server)
        .post('/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const hash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const response = await request(server)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const response = await request(server)
        .post('/auth/login')
        .send({
          email: 'notexist@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject wrong password', async () => {
      const hash = await bcrypt.hash('correctpassword', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const response = await request(server)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });
});
