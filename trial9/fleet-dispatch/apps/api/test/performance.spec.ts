import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

// TRACED: FD-PERF-006
describe('Performance Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = createMockPrismaService();
  const tenantId = 'test-tenant-001';

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

  function getToken(): string {
    return jwtService.sign({ sub: 'user-1', email: 'test@fleet.test', role: 'DISPATCHER', tenantId });
  }

  describe('Response time headers', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should include X-Response-Time on authenticated endpoints', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/vehicles?page=1&pageSize=500')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.body.pageSize).toBe(100);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('should use default page size when not specified', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.body.pageSize).toBe(20);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });

    it('should handle page=0 by defaulting to page 1', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/vehicles?page=0')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.body.page).toBe(1);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0 }),
      );
    });
  });

  describe('Cache-Control headers', () => {
    it('should include Cache-Control on vehicle list', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.headers['cache-control']).toContain('max-age');
    });

    it('should include Cache-Control on driver list', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([]);
      mockPrisma.driver.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/drivers')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.headers['cache-control']).toContain('max-age');
    });

    it('should include Cache-Control on dispatch list', async () => {
      mockPrisma.dispatch.findMany.mockResolvedValue([]);
      mockPrisma.dispatch.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/dispatches')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.headers['cache-control']).toContain('max-age');
    });
  });
});
