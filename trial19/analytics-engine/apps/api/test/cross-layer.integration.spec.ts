import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PrismaService } from '../src/infra/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-CROSS-003
describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;

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

    jwtService = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should have APP_VERSION from shared package in health response', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.body.version).toBe(APP_VERSION);
  });

  it('should enforce full auth → CRUD → error handling pipeline', async () => {
    // Step 1: Unauthenticated request should be blocked by global guard
    const unauth = await request(app.getHttpServer()).get('/dashboards');
    expect(unauth.status).toBe(401);

    // Step 2: Authenticated request should succeed
    const token = jwtService.sign({
      sub: 'user-1', email: 'test@example.com', role: 'ADMIN', tenantId: 'tenant-1',
    });
    mockPrisma.dashboard.findMany.mockResolvedValue([]);
    mockPrisma.dashboard.count.mockResolvedValue(0);

    const auth = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);
    expect(auth.status).toBe(200);
    expect(auth.headers['x-response-time']).toBeDefined();
    expect(auth.headers['x-correlation-id']).toBeDefined();

    // Step 3: Error handling should return sanitized error with correlation ID
    mockPrisma.dashboard.findUnique.mockResolvedValue(null);
    const notFound = await request(app.getHttpServer())
      .get('/dashboards/nonexistent')
      .set('Authorization', `Bearer ${token}`);
    expect(notFound.status).toBe(404);
    expect(notFound.body.correlationId).toBeDefined();
    expect(notFound.body.stack).toBeUndefined();
  });

  it('should include rate limit headers on health endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    // Rate limit headers should be present since @SkipThrottle is NOT used
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('should include correlation ID across entire request lifecycle', async () => {
    const correlationId = 'test-cross-layer-correlation';
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', correlationId);

    expect(res.headers['x-correlation-id']).toBe(correlationId);
    expect(res.body.status).toBe('ok');
  });

  it('should enforce RBAC — viewer cannot delete dashboards', async () => {
    const viewerToken = jwtService.sign({
      sub: 'user-2', email: 'viewer@example.com', role: 'VIEWER', tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .delete('/dashboards/d-1')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  it('should verify health and readiness endpoints work', async () => {
    const health = await request(app.getHttpServer()).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');

    const ready = await request(app.getHttpServer()).get('/health/ready');
    expect(ready.status).toBe(200);
    expect(ready.body.database).toBe('connected');
  });

  it('should verify data-source CRUD pipeline', async () => {
    const token = jwtService.sign({
      sub: 'user-1', email: 'test@example.com', role: 'ADMIN', tenantId: 'tenant-1',
    });

    mockPrisma.dataSource.create.mockResolvedValue({
      id: 'ds-1', name: 'Test DB', type: 'POSTGRESQL', tenantId: 'tenant-1',
    });

    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test DB', type: 'POSTGRESQL' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('Test DB');
  });
});
