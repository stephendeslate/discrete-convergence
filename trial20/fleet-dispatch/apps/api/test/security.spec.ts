import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Security Integration', () => {
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
    app.getHttpAdapter().getInstance().disable('x-powered-by');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    jwtService = moduleFixture.get(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  function getToken(role = 'ADMIN', tenantId = 't1') {
    return jwtService.sign({ sub: '1', email: 'test@test.com', role, tenantId });
  }

  it('should reject expired tokens', async () => {
    const expiredToken = jwtService.sign(
      { sub: '1', email: 'e@t.com', role: 'ADMIN', tenantId: 't1' },
      { expiresIn: '0s' },
    );
    // Wait a moment for token to expire
    await new Promise(resolve => setTimeout(resolve, 50));
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should reject malformed authorization header', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', 'NotBearer token')
      .expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should enforce RBAC - VIEWER cannot delete vehicles', async () => {
    const token = getToken('VIEWER');
    const res = await request(app.getHttpServer())
      .delete('/vehicles/fake-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    expect(res.body.statusCode).toBe(403);
  });

  it('should enforce RBAC - DISPATCHER cannot delete routes', async () => {
    const token = getToken('DISPATCHER');
    const res = await request(app.getHttpServer())
      .delete('/routes/fake-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    expect(res.body.statusCode).toBe(403);
  });

  it('should not expose x-powered-by header', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should return proper error structure for auth failures', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .expect(401);
    expect(res.body).toHaveProperty('statusCode');
    expect(res.body).toHaveProperty('timestamp');
  });
});
