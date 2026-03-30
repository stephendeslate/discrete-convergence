import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService, mockTenantId, MockThrottlerGuard } from './helpers/test-utils';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-CROSS-003
describe('Cross-Layer Integration Tests', () => {
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
      email: 'admin@test.com',
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

  describe('Full Pipeline: Auth → CRUD → Error Handling → Monitoring', () => {
    it('should complete auth → create → read → update → delete flow', async () => {
      // Create
      prisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        title: 'Pipeline Test',
        status: 'DRAFT',
        tenantId: mockTenantId,
        widgets: [],
      });

      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Pipeline Test' })
        .expect(201);
      expect(createRes.body.title).toBe('Pipeline Test');
      expect(createRes.headers['x-response-time']).toBeDefined();

      // Read
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'Pipeline Test',
        tenantId: mockTenantId,
        widgets: [],
      });

      const readRes = await request(app.getHttpServer())
        .get('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(readRes.body.title).toBe('Pipeline Test');
      expect(readRes.headers['x-response-time']).toBeDefined();

      // Update
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        title: 'Updated',
        tenantId: mockTenantId,
        widgets: [],
      });

      const updateRes = await request(app.getHttpServer())
        .put('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(200);
      expect(updateRes.body.title).toBe('Updated');
      expect(updateRes.headers['x-response-time']).toBeDefined();

      // Delete
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await request(app.getHttpServer())
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(prisma.dashboard.delete).toHaveBeenCalled();
    });

    it('should return correlation ID in error responses', async () => {
      prisma.dashboard.findUnique.mockRejectedValue(new Error('DB crash'));

      const response = await request(app.getHttpServer())
        .get('/dashboards/crash-id')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Correlation-ID', 'test-corr-123')
        .expect(500);

      expect(response.body).toHaveProperty('correlationId', 'test-corr-123');
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body.statusCode).toBe(500);
    });

    it('should include APP_VERSION in health endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.status).toBe('ok');
    });

    it('should verify DB connectivity check', async () => {
      prisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.database).toBe('connected');
    });

    it('should enforce tenant isolation in CRUD operations', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'other-dash',
        title: 'Other Tenant Dashboard',
        tenantId: 'other-tenant-id',
        widgets: [],
      });

      const response = await request(app.getHttpServer())
        .get('/dashboards/other-dash')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBeDefined();
    });

    it('should reject unauthenticated access to protected CRUD', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ title: 'Unauthorized' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(prisma.dashboard.create).not.toHaveBeenCalled();
    });

    it('should handle response time across all layer interactions', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.body).toHaveProperty('data');
    });
  });
});
