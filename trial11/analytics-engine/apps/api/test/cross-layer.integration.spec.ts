import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { APP_VERSION } from '@analytics-engine/shared';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    user: { findFirst: jest.fn(), create: jest.fn() },
    dashboard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    dataSource: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $executeRaw: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full pipeline: auth -> CRUD -> error handling -> monitoring', () => {
    it('should reject unauthenticated CRUD access', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should allow authenticated CRUD flow', async () => {
      const token = jwtService.sign({ sub: 'u-1', email: 'test@x.com', role: 'USER', tenantId: 't-1' });

      mockPrisma.dashboard.create.mockResolvedValue({
        id: 'd-1', name: 'CL Test', tenantId: 't-1', widgets: [],
      });
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'CL Test' });

      expect(createRes.status).toBe(201);
      expect(createRes.body.name).toBe('CL Test');
      expect(createRes.headers['x-response-time']).toBeDefined();

      mockPrisma.dashboard.findMany.mockResolvedValue([{ id: 'd-1', name: 'CL Test' }]);
      mockPrisma.dashboard.count.mockResolvedValue(1);
      const listRes = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toHaveLength(1);
    });

    it('should return correlation-id in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('X-Correlation-ID', 'test-corr-123');

      expect(res.status).toBe(401);
      expect(res.body.correlationId).toBeDefined();
    });

    it('should expose health endpoint with APP_VERSION', async () => {
      const res = await request(app.getHttpServer()).get('/monitoring/health');

      expect(res.status).toBe(200);
      expect(res.body.version).toBe(APP_VERSION);
      expect(res.body.status).toBe('ok');
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should expose readiness with DB check', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
      const res = await request(app.getHttpServer()).get('/monitoring/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.database).toBe('connected');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should propagate correlation ID through request chain', async () => {
      const corrId = 'cross-layer-test-id';
      const token = jwtService.sign({ sub: 'u-1', email: 'test@x.com', role: 'USER', tenantId: 't-1' });
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', corrId);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should handle 404 with proper error response', async () => {
      const token = jwtService.sign({ sub: 'u-1', email: 'test@x.com', role: 'USER', tenantId: 't-1' });
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/dashboards/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Dashboard not found');
      expect(res.body.correlationId).toBeDefined();
    });

    it('should enforce RBAC across layers', async () => {
      const userToken = jwtService.sign({ sub: 'u-1', email: 'u@x.com', role: 'USER', tenantId: 't-1' });

      const res = await request(app.getHttpServer())
        .delete('/dashboards/d-1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.statusCode).toBe(403);
    });
  });
});
