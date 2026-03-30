import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken } from './helpers/test-utils';
import { App } from 'supertest/types';

describe('Vehicle Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = {
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $queryRaw: jest.fn(),
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
  });

  describe('POST /vehicles', () => {
    it('should create a vehicle with ADMIN role', async () => {
      const token = createTestToken(jwtService, { role: 'ADMIN' });
      mockPrisma.vehicle.create.mockResolvedValue({
        id: 'vehicle-1',
        licensePlate: 'FL-001',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        status: 'AVAILABLE',
      });

      const response = await request(app.getHttpServer() as App)
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tenantId: 'tenant-1',
          licensePlate: 'FL-001',
          make: 'Ford',
          model: 'Transit',
          year: 2023,
          mileage: 1000,
          fuelCostPerKm: 0.15,
        });

      expect(response.status).toBe(201);
    });

    it('should reject vehicle creation with VIEWER role (403)', async () => {
      const token = createTestToken(jwtService, { role: 'VIEWER' });
      const response = await request(app.getHttpServer() as App)
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tenantId: 'tenant-1',
          licensePlate: 'FL-001',
          make: 'Ford',
          model: 'Transit',
          year: 2023,
          mileage: 1000,
          fuelCostPerKm: 0.15,
        });

      expect(response.status).toBe(403);
    });

    it('should reject vehicle creation with missing fields (400)', async () => {
      const token = createTestToken(jwtService, { role: 'ADMIN' });
      const response = await request(app.getHttpServer() as App)
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          licensePlate: 'FL-001',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /vehicles', () => {
    it('should return paginated vehicles list', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer() as App)
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.headers['cache-control']).toBe('private, max-age=30');
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return 404 for non-existent vehicle', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer() as App)
        .get('/vehicles/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should reject deletion with non-ADMIN role (403)', async () => {
      const token = createTestToken(jwtService, { role: 'DISPATCHER' });
      const response = await request(app.getHttpServer() as App)
        .delete('/vehicles/vehicle-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});
