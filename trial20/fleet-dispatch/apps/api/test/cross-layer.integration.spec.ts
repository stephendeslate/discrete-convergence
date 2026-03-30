import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Cross-Layer Integration', () => {
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

  it('should enforce validation pipeline on vehicle creation', async () => {
    const token = getToken();
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should include correlation ID in error responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('X-Correlation-ID', 'test-corr-123')
      .expect(401);
    expect(res.body.correlationId).toBeDefined();
  });

  it('should reject unknown fields via forbidNonWhitelisted', async () => {
    const token = getToken();
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'v1', licensePlate: 'ABC', make: 'Ford', model: 'F150', year: 2024, mileage: 0, costPerMile: '1.5', unknownField: 'x' })
      .expect(400);
    expect(res.body.message).toBeDefined();
  });

  it('should propagate auth context through middleware chain', async () => {
    const token = getToken('DISPATCHER');
    const res = await request(app.getHttpServer())
      .get('/dispatches')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('should return paginated response for vehicles', async () => {
    const token = getToken();
    const res = await request(app.getHttpServer())
      .get('/vehicles?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
  });

  it('should enforce ADMIN role for vehicle deletion', async () => {
    const viewerToken = jwtService.sign({ sub: '2', email: 'viewer@test.com', role: 'VIEWER', tenantId: 't1' });
    const res = await request(app.getHttpServer())
      .delete('/vehicles/some-id')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);
    expect(res.body.statusCode).toBe(403);
  });
});
