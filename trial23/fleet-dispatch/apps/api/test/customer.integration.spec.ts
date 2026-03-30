import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  createTestApp,
  generateToken,
  PrismaMock,
  TEST_USER,
} from './helpers/test-app';

describe('Customer Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaMock;
  let token: string;

  const mockCustomer = {
    id: 'cust-001',
    name: 'Jane Customer',
    email: 'jane@customer.com',
    phone: '+1-555-0202',
    address: '456 Oak Ave',
    notes: 'Preferred morning appointments',
    companyId: 'company-001',
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

  describe('POST /customers', () => {
    it('should create a customer with valid data', async () => {
      prisma.customer.create.mockResolvedValue(mockCustomer);

      const res = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Jane Customer',
          email: 'jane@customer.com',
          phone: '+1-555-0202',
          address: '456 Oak Ave',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'cust-001');
      expect(res.body).toHaveProperty('name', 'Jane Customer');
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '+1-555-0000' })
        .expect(400);
    });
  });

  describe('GET /customers', () => {
    it('should return paginated list of customers', async () => {
      prisma.customer.findMany.mockResolvedValue([mockCustomer]);
      prisma.customer.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('total', 1);
    });
  });

  describe('GET /customers/:id', () => {
    it('should return a single customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);

      const res = await request(app.getHttpServer())
        .get('/customers/cust-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', 'cust-001');
      expect(res.body).toHaveProperty('email', 'jane@customer.com');
    });
  });

  describe('PUT /customers/:id', () => {
    it('should update a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);
      prisma.customer.update.mockResolvedValue({
        ...mockCustomer,
        address: '789 Pine Blvd',
      });

      const res = await request(app.getHttpServer())
        .put('/customers/cust-001')
        .set('Authorization', `Bearer ${token}`)
        .send({ address: '789 Pine Blvd' })
        .expect(200);

      expect(res.body).toHaveProperty('address', '789 Pine Blvd');
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should delete a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);
      prisma.customer.delete.mockResolvedValue(mockCustomer);

      await request(app.getHttpServer())
        .delete('/customers/cust-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 for non-existent customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/customers/nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Authentication', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/customers')
        .expect(401);
    });

    it('should include correlation ID in response', async () => {
      prisma.customer.findMany.mockResolvedValue([]);
      prisma.customer.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['x-correlation-id']).toBeDefined();
    });
  });
});
