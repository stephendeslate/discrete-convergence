import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Security Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    dashboard: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn() },
    dataSource: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    queryExecution: { findMany: jest.fn(), count: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

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
    jwtService = moduleFixture.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 for missing token', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for expired token', async () => {
    const expiredToken = jwtService.sign(
      { sub: 'user-1', email: 'test@test.com', role: 'USER', tenantId: 'tenant-1' },
      { expiresIn: '0s' },
    );

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should reject forbidden role on admin-only endpoint', async () => {
    const viewerToken = jwtService.sign({
      sub: 'user-1',
      email: 'viewer@test.com',
      role: 'VIEWER',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'Test', type: 'POSTGRESQL' });

    expect(res.status).toBe(403);
    expect(res.body.statusCode).toBe(403);
  });

  it('should allow admin role on admin-only endpoint', async () => {
    const adminToken = jwtService.sign({
      sub: 'user-1',
      email: 'admin@test.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
    mockPrisma.dataSource.create.mockResolvedValue({
      id: 'ds-1',
      name: 'Test',
      type: 'POSTGRESQL',
      tenantId: 'tenant-1',
      widgets: [],
    });

    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test', type: 'POSTGRESQL' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test');
  });

  it('should reject request with extra fields (forbidNonWhitelisted)', async () => {
    const token = jwtService.sign({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', malicious: 'field' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('should not leak stack traces in errors', async () => {
    const token = jwtService.sign({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'USER',
      tenantId: 'tenant-1',
    });
    mockPrisma.dashboard.findMany.mockRejectedValueOnce(new Error('Internal error'));

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.stack).toBeUndefined();
    expect(res.body.correlationId).toBeDefined();
  });

  it('should allow public access to health endpoints', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
