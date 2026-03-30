import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken } from './helpers/test-utils';
import { App } from 'supertest/types';

describe('Performance Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    user: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn() },
    vehicle: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
    driver: { findMany: jest.fn(), count: jest.fn() },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jwtService = moduleFixture.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('X-Response-Time header', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const response = await request(app.getHttpServer() as App).get('/health');
      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on authenticated endpoints', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer() as App)
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should respect page and pageSize parameters', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(50);

      const response = await request(app.getHttpServer() as App)
        .get('/vehicles?page=2&pageSize=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(10);
    });

    it('should clamp pageSize to MAX_PAGE_SIZE', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer() as App)
        .get('/vehicles?page=1&pageSize=500')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.pageSize).toBe(100);
    });
  });

  describe('Cache-Control headers', () => {
    it('should have Cache-Control on vehicle list', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer() as App)
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.headers['cache-control']).toBe('private, max-age=30');
    });

    it('should have Cache-Control on driver list', async () => {
      const token = createTestToken(jwtService);
      mockPrisma.driver.findMany.mockResolvedValue([]);
      mockPrisma.driver.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer() as App)
        .get('/drivers')
        .set('Authorization', `Bearer ${token}`);

      expect(response.headers['cache-control']).toBe('private, max-age=30');
    });
  });
});
