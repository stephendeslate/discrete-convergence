import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Security Integration', () => {
  let app: INestApplication;
  const mockPrisma = {
    user: { findFirst: jest.fn() },
    event: { findMany: jest.fn(), count: jest.fn() },
    venue: { findMany: jest.fn(), count: jest.fn() },
    attendee: { findMany: jest.fn(), count: jest.fn() },
    registration: { findMany: jest.fn(), count: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $on: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
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
    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should not expose X-Powered-By header', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should return 401 for protected routes without token', async () => {
    const res = await request(app.getHttpServer()).get('/events');

    expect(res.status).toBe(401);
  });

  it('should return 401 for invalid JWT token', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer invalid-jwt-token');

    expect(res.status).toBe(401);
  });

  it('should handle SQL injection attempt safely', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "admin@test.com' OR 1=1--",
        password: 'password',
      });

    expect(res.status).toBe(400);
  });

  it('should handle XSS in URL path', async () => {
    const res = await request(app.getHttpServer()).get('/<script>alert(1)</script>');

    expect(res.status).toBe(404);
    expect(res.body.message).not.toContain('<script>');
  });

  it('should reject requests with extra fields (forbidNonWhitelisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'VIEWER',
        tenantId: 'tenant-1',
        malicious: 'injection',
      });

    expect(res.status).toBe(400);
  });

  it('should include security headers from Helmet', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should return 401 for expired token', async () => {
    const { JwtService } = require('@nestjs/jwt');
    const jwtService = new JwtService({ secret: 'test-secret' });
    const expiredToken = jwtService.sign(
      { sub: 'user-1', email: 'a@b.com', role: 'VIEWER', tenantId: 'tenant-1' },
      { expiresIn: '0s' },
    );

    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it('should return 401 for dashboards without auth', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');

    expect(res.status).toBe(401);
  });

  it('should return 401 for data-sources without auth', async () => {
    const res = await request(app.getHttpServer()).get('/data-sources');

    expect(res.status).toBe(401);
  });
});
