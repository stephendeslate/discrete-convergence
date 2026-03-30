import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  createTestApp,
  generateToken,
  PrismaMock,
  TEST_USER,
} from './helpers/test-app';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaMock;
  let token: string;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    module = ctx.module;
    prisma = ctx.prisma;
    token = generateToken(module, TEST_USER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.healthCheck.mockResolvedValue(true);
  });

  describe('Correlation ID', () => {
    it('should propagate X-Correlation-ID from request to response', async () => {
      const correlationId = '550e8400-e29b-41d4-a716-446655440000';

      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId)
        .expect(200);

      expect(res.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should generate X-Correlation-ID when not provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('Response Time header', () => {
    it('should include X-Response-Time header on authenticated endpoints', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });
  });

  describe('Pagination clamping', () => {
    it('should clamp page < 1 to page 1', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/work-orders?page=0')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.meta.page).toBeGreaterThanOrEqual(1);
    });

    it('should clamp limit > 100 to max page size', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/work-orders?limit=100')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.meta.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('Data source test endpoint', () => {
    it('should test data source connection and return sanitized result', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-001',
        name: 'Test DB',
        type: 'POSTGRES',
        connectionString: 'postgresql://user:password=secret123@localhost:5432/testdb',
        companyId: 'company-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const res = await request(app.getHttpServer())
        .post('/data-sources/ds-001/test')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('sanitizedConnection');
      expect(res.body.sanitizedConnection).toContain('[REDACTED]');
    });
  });

  describe('Route with stops', () => {
    it('should add a stop to a route', async () => {
      prisma.route.findFirst.mockResolvedValue({
        id: 'route-001',
        name: 'Morning Route',
        technicianId: 'tech-001',
        companyId: 'company-001',
        stops: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      prisma.routeStop.findFirst.mockResolvedValue(null);
      prisma.routeStop.create.mockResolvedValue({
        id: 'stop-001',
        routeId: 'route-001',
        workOrderId: 'wo-001',
        order: 1,
      });

      const res = await request(app.getHttpServer())
        .post('/routes/route-001/stops')
        .set('Authorization', `Bearer ${token}`)
        .send({ workOrderId: 'wo-001', order: 1 })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'stop-001');
      expect(res.body).toHaveProperty('routeId', 'route-001');
    });
  });

  describe('Company-scoped isolation', () => {
    it('should scope work order queries to the authenticated company', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(prisma.setTenantContext).toHaveBeenCalledWith('company-001');
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: 'company-001' }),
        }),
      );
    });

    it('should scope technician queries to the authenticated company', async () => {
      prisma.technician.findMany.mockResolvedValue([]);
      prisma.technician.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/technicians')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(prisma.setTenantContext).toHaveBeenCalledWith('company-001');
      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: 'company-001' }),
        }),
      );
    });
  });
});
