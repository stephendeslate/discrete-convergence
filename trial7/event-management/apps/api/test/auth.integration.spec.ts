import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

describe('Auth Integration (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(0),
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
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use shared BCRYPT_SALT_ROUNDS constant', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  describe('POST /auth/register', () => {
    it('should return 400 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test',
          tenantId: 'tenant-1',
          role: 'USER',
        });
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});
      expect(response.status).toBe(400);
    });

    it('should return 400 for ADMIN role registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          tenantId: 'tenant-1',
          role: 'ADMIN',
        });
      expect(response.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
          tenantId: 'tenant-1',
          role: 'USER',
        });
      expect(response.status).toBe(400);
    });

    it('should return 400 for forbidden extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          tenantId: 'tenant-1',
          role: 'USER',
          isAdmin: true,
        });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 400 for missing credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'bad', password: 'password123' });
      expect(response.status).toBe(400);
    });

    it('should return 401 for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });
      expect(response.status).toBe(401);
    });
  });
});
