import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('Performance Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    dashboard: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
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
    token = jwtService.sign({ sub: 'u-1', email: 'test@test.com', role: 'USER', tenantId: 't-1' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Response Time Headers', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const res = await request(app.getHttpServer()).get('/monitoring/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on authenticated endpoint', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/\d+(\.\d+)?ms/);
    });

    it('should format response time with ms suffix', async () => {
      const res = await request(app.getHttpServer()).get('/monitoring/metrics');

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toMatch(/^\d+\.\d{2}ms$/);
    });
  });

  describe('Pagination', () => {
    it('should accept page and pageSize query params', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/dashboards?page=2&pageSize=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(2);
      expect(res.body.pageSize).toBe(5);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('should clamp pageSize to MAX_PAGE_SIZE (100)', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/dashboards?page=1&pageSize=500')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.pageSize).toBe(100);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('should default to page 1 and pageSize 20', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(20);
    });

    it('should handle negative page gracefully', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/dashboards?page=-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
    });
  });

  describe('Data Sources pagination', () => {
    it('should support pagination on data sources', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([]);
      mockPrisma.dataSource.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/data-sources?page=1&pageSize=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });
});
