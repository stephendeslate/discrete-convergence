import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken } from './helpers/test-utils';
import { App } from 'supertest/types';

describe('Security Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    user: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn() },
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    auditLog: { findMany: jest.fn(), count: jest.fn() },
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

  describe('Authentication', () => {
    it('should reject requests without token (401)', async () => {
      const response = await request(app.getHttpServer() as App).get(
        '/vehicles',
      );
      expect(response.status).toBe(401);
    });

    it('should reject requests with expired/invalid token (401)', async () => {
      const response = await request(app.getHttpServer() as App)
        .get('/vehicles')
        .set('Authorization', 'Bearer expired.invalid.token');
      expect(response.status).toBe(401);
    });
  });

  describe('Authorization (RBAC)', () => {
    it('should allow ADMIN to access admin-only routes', async () => {
      const token = createTestToken(jwtService, { role: 'ADMIN' });
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer() as App)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should reject VIEWER from admin-only routes (403)', async () => {
      const token = createTestToken(jwtService, { role: 'VIEWER' });

      const response = await request(app.getHttpServer() as App)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('should reject DRIVER from creating vehicles (403)', async () => {
      const token = createTestToken(jwtService, { role: 'DRIVER' });

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
  });

  describe('Input Validation', () => {
    it('should reject malformed request bodies (400)', async () => {
      const token = createTestToken(jwtService, { role: 'ADMIN' });

      const response = await request(app.getHttpServer() as App)
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
    });

    it('should strip non-whitelisted fields', async () => {
      const token = createTestToken(jwtService, { role: 'ADMIN' });

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
          _malicious: 'payload',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Error sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.vehicle.findUnique.mockRejectedValueOnce(
        new Error('Internal DB error'),
      );

      const response = await request(app.getHttpServer() as App)
        .get('/vehicles/bad-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).toHaveProperty('correlationId');
    });
  });
});
