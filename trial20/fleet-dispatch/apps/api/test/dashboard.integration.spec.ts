import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Dashboard & DataSource Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = {
    vehicle: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    route: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    driver: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    dispatch: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
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
    jwtService = moduleFixture.get(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  function getToken(role = 'ADMIN') {
    return jwtService.sign({ sub: '1', email: 'test@test.com', role, tenantId: 't1' });
  }

  it('should return 401 for unauthenticated dashboard request', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards').expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return empty array for authenticated dashboard request', async () => {
    const token = getToken();
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toEqual([]);
  });

  it('should return 401 for unauthenticated data-sources request', async () => {
    const res = await request(app.getHttpServer()).get('/data-sources').expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return empty array for authenticated data-sources request', async () => {
    const token = getToken();
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toEqual([]);
  });

  it('should return vehicles for authenticated user', async () => {
    const token = getToken('VIEWER');
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('should return routes for authenticated user', async () => {
    const token = getToken('DISPATCHER');
    const res = await request(app.getHttpServer())
      .get('/routes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('should return drivers for authenticated user', async () => {
    const token = getToken('VIEWER');
    const res = await request(app.getHttpServer())
      .get('/drivers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('should return dispatches for authenticated user', async () => {
    const token = getToken('DISPATCHER');
    const res = await request(app.getHttpServer())
      .get('/dispatches')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });
});
