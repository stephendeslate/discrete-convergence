import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-PERF-006
describe('Performance Integration', () => {
  let app: INestApplication;
  let jwtToken: string;

  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockPrisma = {
    event: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    venue: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    ticket: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    schedule: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    attendee: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(1),
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

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'ORGANIZER',
      tenantId: testTenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response time headers', () => {
    it('should include X-Response-Time on all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should include X-Response-Time on protected endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });
  });

  describe('Pagination', () => {
    it('should return paginated results with meta', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?page=1&pageSize=10')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.pageSize).toBe(10);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?page=1&pageSize=500')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.meta.pageSize).toBeLessThanOrEqual(100);
    });

    it('should handle default pagination when no params', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.meta.pageSize).toBe(20);
    });
  });

  describe('Endpoint response times', () => {
    it('should respond quickly to health check', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it('should respond quickly to list endpoints', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });
});
