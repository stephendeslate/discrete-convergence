import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';
import { NoopThrottlerGuard } from './helpers/test-utils';

// TRACED: AE-PERF-004
describe('Performance Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '660e8400-e29b-41d4-a716-446655440001';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ThrottlerGuard)
      .useClass(NoopThrottlerGuard)
      .overrideProvider(PrismaService)
      .useValue({
        user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
        dashboard: {
          findMany: jest.fn().mockResolvedValue([]),
          findUnique: jest.fn(),
          count: jest.fn().mockResolvedValue(0),
        },
        widget: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        dataSource: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $executeRaw: jest.fn().mockResolvedValue(1),
      })
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
    authToken = await jwtService.signAsync({
      sub: userId,
      email: 'test@test.com',
      role: 'USER',
      tenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response time headers', () => {
    it('should include X-Response-Time header on authenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+(\.\d+)?ms/);
    });

    it('should include X-Response-Time on public endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should use default page size when not specified', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pageSize).toBe(DEFAULT_PAGE_SIZE);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards?pageSize=500')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should accept valid pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards?page=2&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(10);
    });

    it('should handle zero page gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards?page=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
    });
  });

  describe('Cache-Control headers', () => {
    it('should include Cache-Control on list endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBeDefined();
      expect(response.headers['cache-control']).toContain('private');
    });

    it('should include Cache-Control on widgets list', async () => {
      const response = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBeDefined();
    });

    it('should include Cache-Control on data-sources list', async () => {
      const response = await request(app.getHttpServer())
        .get('/data-sources')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBeDefined();
    });
  });
});
