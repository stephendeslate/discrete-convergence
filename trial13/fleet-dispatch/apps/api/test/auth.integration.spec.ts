import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $executeRaw: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
  user: {
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    count: jest.fn(),
  },
};

describe('Auth Integration', () => {
  let app: INestApplication;

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
    if (app) await app.close();
  });

  describe('POST /auth/login', () => {
    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should reject empty body', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'test123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/register', () => {
    it('should reject registration without required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject admin role registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'test123',
          role: 'admin',
          tenantId: '00000000-0000-0000-0000-000000000001',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'test123',
          role: 'viewer',
          tenantId: '00000000-0000-0000-0000-000000000001',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject forbidden fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'test123',
          role: 'viewer',
          tenantId: '00000000-0000-0000-0000-000000000001',
          extraField: 'should be rejected',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Protected endpoints', () => {
    it('should reject access without token', async () => {
      const response = await request(app.getHttpServer()).get('/vehicles');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers')
        .set('Authorization', 'NotBearer token');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should reject expired token format', async () => {
      const response = await request(app.getHttpServer())
        .get('/dispatches')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.expired.invalid');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });
});
