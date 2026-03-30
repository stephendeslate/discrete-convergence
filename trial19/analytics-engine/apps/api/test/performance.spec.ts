import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Performance Integration', () => {
  let app: INestApplication;
  let token: string;

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

    const jwtService = moduleRef.get(JwtService);
    token = jwtService.sign({ sub: 'user-1', email: 'test@example.com', role: 'ADMIN', tenantId: 'tenant-1' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include X-Response-Time header on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
  });

  it('should include X-Correlation-ID on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('should include Cache-Control on dashboard list endpoint', async () => {
    mockPrisma.dashboard.findMany.mockResolvedValue([]);
    mockPrisma.dashboard.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('should include Cache-Control on data source list endpoint', async () => {
    mockPrisma.dataSource.findMany.mockResolvedValue([]);
    mockPrisma.dataSource.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${token}`);

    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('should include Cache-Control on widget list endpoint', async () => {
    mockPrisma.widget.findMany.mockResolvedValue([]);
    mockPrisma.widget.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/widgets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('should respond to health check under 200ms', async () => {
    const start = Date.now();
    const res = await request(app.getHttpServer()).get('/health');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  it('should handle pagination parameters', async () => {
    mockPrisma.dashboard.findMany.mockResolvedValue([]);
    mockPrisma.dashboard.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/dashboards?page=2&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(5);
  });

  it('should clamp page size to MAX_PAGE_SIZE', async () => {
    mockPrisma.dashboard.findMany.mockResolvedValue([]);
    mockPrisma.dashboard.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/dashboards?limit=500')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.limit).toBeLessThanOrEqual(100);
  });
});
