import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken } from './helpers/test-utils';
import { APP_VERSION } from '@fleet-dispatch/shared';
import { App } from 'supertest/types';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $executeRaw: jest.fn(),
    user: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn() },
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeAll(async () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
  });

  describe('Full pipeline: auth -> CRUD -> error handling -> correlation -> response time -> health', () => {
    it('should complete auth flow and CRUD operations', async () => {
      // 1. Health check (public)
      const healthResponse = await request(app.getHttpServer() as App).get(
        '/health',
      );
      expect(healthResponse.status).toBe(200);
      expect(healthResponse.body.version).toBe(APP_VERSION);

      // 2. DB readiness (public)
      const readyResponse = await request(app.getHttpServer() as App).get(
        '/health/ready',
      );
      expect(readyResponse.status).toBe(200);

      // 3. Protected route without token = 401
      const unauthedResponse = await request(app.getHttpServer() as App).get(
        '/vehicles',
      );
      expect(unauthedResponse.status).toBe(401);

      // 4. Create token and access protected route
      const token = createTestToken(jwtService, { role: 'ADMIN' });
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const vehiclesResponse = await request(app.getHttpServer() as App)
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);
      expect(vehiclesResponse.status).toBe(200);
      expect(vehiclesResponse.headers['x-response-time']).toBeDefined();
      expect(vehiclesResponse.headers['cache-control']).toBe(
        'private, max-age=30',
      );

      // 5. CRUD: Create vehicle
      mockPrisma.vehicle.create.mockResolvedValue({
        id: 'v1',
        tenantId: 'test-tenant-id',
        licensePlate: 'FL-TEST',
      });
      const createResponse = await request(app.getHttpServer() as App)
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tenantId: 'test-tenant-id',
          licensePlate: 'FL-TEST',
          make: 'Ford',
          model: 'Transit',
          year: 2023,
          mileage: 0,
          fuelCostPerKm: 0.12,
        });
      expect(createResponse.status).toBe(201);

      // 6. Error handling: 404 not found
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);
      const notFoundResponse = await request(app.getHttpServer() as App)
        .get('/vehicles/non-existent')
        .set('Authorization', `Bearer ${token}`);
      expect(notFoundResponse.status).toBe(404);
      expect(notFoundResponse.body).toHaveProperty('correlationId');
      expect(notFoundResponse.body).not.toHaveProperty('stack');

      // 7. Metrics
      const metricsResponse = await request(app.getHttpServer() as App).get(
        '/metrics',
      );
      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.body).toHaveProperty('requestCount');
    });

    it('should enforce RBAC through full pipeline', async () => {
      const viewerToken = createTestToken(jwtService, { role: 'VIEWER' });

      // Viewer cannot create vehicles
      const createResponse = await request(app.getHttpServer() as App)
        .post('/vehicles')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          tenantId: 'test-tenant-id',
          licensePlate: 'FL-X',
          make: 'Ford',
          model: 'Transit',
          year: 2023,
          mileage: 0,
          fuelCostPerKm: 0.12,
        });
      expect(createResponse.status).toBe(403);

      // Viewer cannot delete vehicles
      const deleteResponse = await request(app.getHttpServer() as App)
        .delete('/vehicles/v1')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(deleteResponse.status).toBe(403);
    });

    it('should include correlation IDs in error responses', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer() as App)
        .get('/vehicles/bad-id')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', 'test-corr-123');

      expect(response.body.correlationId).toBe('test-corr-123');
    });
  });
});
