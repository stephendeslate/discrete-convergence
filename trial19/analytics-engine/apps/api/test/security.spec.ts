import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Security Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    dashboard: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 for unauthenticated requests to protected routes', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
  });

  it('should return 401 for invalid Bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer fake-jwt-token');
    expect(res.status).toBe(401);
  });

  it('should not expose stack traces in error responses', async () => {
    const res = await request(app.getHttpServer()).get('/nonexistent-route');
    expect(res.body.stack).toBeUndefined();
    expect(res.body.trace).toBeUndefined();
  });

  it('should include correlation ID in error responses', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('should reject requests with extra fields via forbidNonWhitelisted', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        tenantId: 'tenant-1',
        role: 'USER',
        malicious: 'payload',
      });
    expect(res.status).toBe(400);
  });

  it('should handle SQL injection attempts safely', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "admin@example.com'; DROP TABLE users; --",
        password: 'password',
      });

    // Should get 400 (invalid email format) not 500
    expect(res.status).toBe(400);
  });

  it('should handle XSS attempts in URL path', async () => {
    const res = await request(app.getHttpServer())
      .get('/<script>alert(1)</script>');

    expect(res.body.message).toBeDefined();
    expect(res.text).not.toContain('<script>');
  });

  it('should return 401 for expired token', async () => {
    const { JwtService } = require('@nestjs/jwt');
    const jwtService = app.get(JwtService);
    const expiredToken = jwtService.sign(
      { sub: 'user-1', email: 'test@example.com', role: 'USER', tenantId: 'tenant-1' },
      { expiresIn: '0s' },
    );

    // Small delay to ensure token expires
    await new Promise((resolve) => setTimeout(resolve, 100));

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it('should return 401 for missing authorization header', async () => {
    const res = await request(app.getHttpServer()).get('/widgets');
    expect(res.status).toBe(401);
  });

  it('should return 401 for malformed authorization header', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'NotBearer token');
    expect(res.status).toBe(401);
  });
});
