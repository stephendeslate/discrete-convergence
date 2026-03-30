// VERIFY:FD-VEH-INT-001 — Vehicles: list returns paginated data
// VERIFY:FD-VEH-INT-002 — Vehicles: requires authentication
// VERIFY:FD-VEH-INT-003 — Vehicles: create returns new vehicle

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, generateTestToken, MockPrismaService } from './helpers/test-utils';

describe('Vehicle Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: MockPrismaService;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    token = generateTestToken();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /vehicles', () => {
    it('should return paginated vehicles', async () => {
      prisma.vehicle.findMany.mockResolvedValue([]);
      prisma.vehicle.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/vehicles')
        .expect(401);
    });
  });

  describe('POST /vehicles', () => {
    it('should create a vehicle', async () => {
      const mockVehicle = {
        id: 'v-1',
        name: 'Truck A',
        plateNumber: 'ABC123',
        type: 'TRUCK',
        capacity: 10,
        status: 'ACTIVE',
        tenantId: 'test-tenant-id',
      };
      prisma.vehicle.create.mockResolvedValue(mockVehicle);

      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Truck A',
          plateNumber: 'ABC123',
          type: 'TRUCK',
          capacity: 10,
        })
        .expect(201);

      expect(response.body.name).toBe('Truck A');
    });

    it('should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Invalid' })
        .expect(400);
    });
  });
});
