import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Auth Integration (FD-AUTH)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED: FD-AUTH-001
  it('should reject login with missing fields', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // TRACED: FD-AUTH-002
  it('should reject login with invalid email', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'not-email',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // TRACED: FD-AUTH-003
  it('should reject registration with ADMIN role', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'admin@test.com',
      password: 'password123',
      role: 'ADMIN',
      tenantId: 'test-tenant',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // TRACED: FD-AUTH-004
  it('should reject registration with short password', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'user@test.com',
      password: 'short',
      role: 'USER',
      tenantId: 'test-tenant',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // TRACED: FD-AUTH-005
  it('should reject login with extra fields', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'test@test.com',
      password: 'password123',
      extraField: 'should-not-be-here',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // TRACED: FD-AUTH-006
  it('should return 401 for expired/invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', 'Bearer expired.invalid.token');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-AUTH-007
  it('should return 401 for missing token on protected route', async () => {
    const res = await request(app.getHttpServer()).get('/vehicles');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-AUTH-008
  it('should allow public health endpoint without token', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
