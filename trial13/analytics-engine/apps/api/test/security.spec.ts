import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService, mockTenantId, MockThrottlerGuard } from './helpers/test-utils';

describe('Security Integration Tests', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: JwtService;

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
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should reject requests without token to protected endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should reject requests with expired token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 'user-1', email: 'test@test.com', role: 'VIEWER', tenantId: mockTenantId },
        { expiresIn: '0s' },
      );

      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should accept requests with valid token', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@test.com',
        role: 'VIEWER',
        tenantId: mockTenantId,
      });

      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual([]);
    });
  });

  describe('RBAC', () => {
    it('should allow admin to delete dashboards', async () => {
      const adminToken = jwtService.sign({
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        tenantId: mockTenantId,
      });

      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        tenantId: mockTenantId,
        widgets: [],
      });
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await request(app.getHttpServer())
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      expect(prisma.dashboard.delete).toHaveBeenCalled();
    });

    it('should deny viewer from deleting dashboards', async () => {
      const viewerToken = jwtService.sign({
        sub: 'user-2',
        email: 'viewer@test.com',
        role: 'VIEWER',
        tenantId: mockTenantId,
      });

      const response = await request(app.getHttpServer())
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);

      expect(response.body.statusCode).toBe(403);
      expect(prisma.dashboard.delete).not.toHaveBeenCalled();
    });

    it('should deny viewer from creating data sources', async () => {
      const viewerToken = jwtService.sign({
        sub: 'user-2',
        email: 'viewer@test.com',
        role: 'VIEWER',
        tenantId: mockTenantId,
      });

      const response = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Test DB', type: 'POSTGRESQL', connectionInfo: {} })
        .expect(403);

      expect(response.body.statusCode).toBe(403);
      expect(prisma.dataSource.create).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should reject request with extra fields', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        tenantId: mockTenantId,
      });

      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', hackerField: 'inject' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject request with missing required fields', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        tenantId: mockTenantId,
      });

      const response = await request(app.getHttpServer())
        .post('/widgets')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should not leak stack traces in error responses', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        tenantId: mockTenantId,
      });

      prisma.dashboard.findUnique.mockRejectedValue(new Error('DB error'));

      const response = await request(app.getHttpServer())
        .get('/dashboards/bad-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).toHaveProperty('statusCode', 500);
      expect(response.body).toHaveProperty('correlationId');
    });
  });

  describe('Public endpoints', () => {
    it('should allow unauthenticated access to health', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body.status).toBe('ok');
    });

    it('should allow unauthenticated access to auth endpoints', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBeDefined();
    });
  });
});
