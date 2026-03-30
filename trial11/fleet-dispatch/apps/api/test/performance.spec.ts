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
    vehicle: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    driver: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    dispatch: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
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
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({
      sub: 'user-1',
      email: 'admin@fleet.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response Time Headers', () => {
    it('should include X-Response-Time on vehicle list', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/\d+.*ms/);
    });

    it('should include X-Response-Time on driver list', async () => {
      const res = await request(app.getHttpServer())
        .get('/drivers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on dispatch list', async () => {
      const res = await request(app.getHttpServer())
        .get('/dispatches')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on health endpoint', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should support page and pageSize parameters', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles?page=1&pageSize=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should clamp pageSize to MAX_PAGE_SIZE', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles?page=1&pageSize=500')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });

    it('should use default pagination for drivers', async () => {
      const res = await request(app.getHttpServer())
        .get('/drivers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('Correlation ID propagation', () => {
    it('should return correlation ID on all responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('should preserve client-provided correlation ID', async () => {
      const id = 'custom-corr-id-123';
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', id);

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBe(id);
    });
  });
});
