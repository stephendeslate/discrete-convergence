import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService, mockTenantId, MockThrottlerGuard } from './helpers/test-utils';

describe('Performance Integration Tests', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    prisma = createMockPrismaService();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(ThrottlerGuard)
      .useClass(MockThrottlerGuard)
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

    jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = jwtService.sign({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      tenantId: mockTenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Response Time Header', () => {
    it('should include X-Response-Time header on health endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-response-time');
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should include X-Response-Time header on protected endpoints', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers).toHaveProperty('x-response-time');
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should include X-Response-Time on error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);

      expect(response.headers).toHaveProperty('x-response-time');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Pagination', () => {
    it('should apply default pagination', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(20);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should clamp page size to max', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/dashboards?pageSize=500')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pageSize).toBeLessThanOrEqual(100);
      expect(prisma.dashboard.findMany).toHaveBeenCalled();
    });

    it('should support custom page and pageSize', async () => {
      prisma.widget.findMany.mockResolvedValue([]);
      prisma.widget.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/widgets?page=2&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(10);
      expect(prisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });
});
