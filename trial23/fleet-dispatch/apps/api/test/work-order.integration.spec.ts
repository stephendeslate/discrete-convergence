import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  createTestApp,
  generateToken,
  PrismaMock,
  TEST_USER,
} from './helpers/test-app';

describe('WorkOrder Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaMock;
  let token: string;

  const mockWorkOrder = {
    id: 'wo-001',
    title: 'Fix HVAC unit',
    description: 'Unit not cooling properly',
    status: 'UNASSIGNED',
    companyId: 'company-001',
    technicianId: null,
    customerId: null,
    address: '123 Main St',
    scheduledAt: '2026-04-01T10:00:00.000Z',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

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
  });

  describe('POST /work-orders', () => {
    it('should create a work order with valid data', async () => {
      prisma.workOrder.create.mockResolvedValue(mockWorkOrder);

      const res = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Fix HVAC unit',
          description: 'Unit not cooling properly',
          address: '123 Main St',
          scheduledAt: '2026-04-01T10:00:00.000Z',
          priority: 'HIGH',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'wo-001');
      expect(res.body).toHaveProperty('title', 'Fix HVAC unit');
    });

    it('should return 400 for missing title', async () => {
      await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title provided' })
        .expect(400);
    });
  });

  describe('GET /work-orders', () => {
    it('should return paginated list of work orders', async () => {
      prisma.workOrder.findMany.mockResolvedValue([mockWorkOrder]);
      prisma.workOrder.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('total', 1);
      expect(res.body.meta).toHaveProperty('page', 1);
    });

    it('should accept pagination query params', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/work-orders?page=2&limit=5')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.meta).toHaveProperty('page', 2);
      expect(res.body.meta).toHaveProperty('limit', 5);
    });
  });

  describe('GET /work-orders/:id', () => {
    it('should return a single work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);

      const res = await request(app.getHttpServer())
        .get('/work-orders/wo-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', 'wo-001');
      expect(res.body).toHaveProperty('title', 'Fix HVAC unit');
    });

    it('should return 404 for non-existent work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/work-orders/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PUT /work-orders/:id', () => {
    it('should update a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        title: 'Updated HVAC repair',
      });

      const res = await request(app.getHttpServer())
        .put('/work-orders/wo-001')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated HVAC repair' })
        .expect(200);

      expect(res.body).toHaveProperty('title', 'Updated HVAC repair');
    });
  });

  describe('PATCH /work-orders/:id/status', () => {
    it('should update work order status with valid transition', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: 'ASSIGNED',
      });

      const res = await request(app.getHttpServer())
        .patch('/work-orders/wo-001/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'ASSIGNED' })
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ASSIGNED');
    });

    it('should return 400 for invalid status transition', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);

      await request(app.getHttpServer())
        .patch('/work-orders/wo-001/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'COMPLETED' })
        .expect(400);
    });
  });

  describe('DELETE /work-orders/:id', () => {
    it('should delete a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);
      prisma.workOrder.delete.mockResolvedValue(mockWorkOrder);

      await request(app.getHttpServer())
        .delete('/work-orders/wo-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/work-orders/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Authentication and headers', () => {
    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/work-orders')
        .expect(401);
    });

    it('should include X-Response-Time header on list endpoint', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });

    it('should include X-Correlation-ID header on responses', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.workOrder.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['x-correlation-id']).toBeDefined();
    });
  });
});
