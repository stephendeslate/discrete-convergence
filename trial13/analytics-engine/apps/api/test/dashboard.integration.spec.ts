import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService, mockTenantId, MockThrottlerGuard } from './helpers/test-utils';

describe('Dashboard Integration Tests', () => {
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
      email: 'test@example.com',
      role: 'ADMIN',
      tenantId: mockTenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /dashboards', () => {
    it('should create a dashboard', async () => {
      prisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        title: 'Sales Dashboard',
        description: 'Monthly sales',
        status: 'DRAFT',
        tenantId: mockTenantId,
        widgets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Sales Dashboard', description: 'Monthly sales' })
        .expect(201);

      expect(response.body).toHaveProperty('title', 'Sales Dashboard');
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Sales Dashboard',
            tenantId: mockTenantId,
          }),
        }),
      );
    });

    it('should reject dashboard creation without auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ title: 'Sales Dashboard' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(prisma.dashboard.create).not.toHaveBeenCalled();
    });

    it('should reject dashboard creation with empty title', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /dashboards', () => {
    it('should return paginated dashboards', async () => {
      const dashboards = [
        { id: 'dash-1', title: 'Dashboard 1', tenantId: mockTenantId, widgets: [] },
        { id: 'dash-2', title: 'Dashboard 2', tenantId: mockTenantId, widgets: [] },
      ];
      prisma.dashboard.findMany.mockResolvedValue(dashboards);
      prisma.dashboard.count.mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: mockTenantId },
        }),
      );
    });

    it('should reject list without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(prisma.dashboard.findMany).not.toHaveBeenCalled();
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should return a single dashboard', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'Dashboard 1',
        tenantId: mockTenantId,
        widgets: [],
      });

      const response = await request(app.getHttpServer())
        .get('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Dashboard 1');
      expect(prisma.dashboard.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dash-1' },
        }),
      );
    });

    it('should return 404 for non-existent dashboard', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/dashboards/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(prisma.dashboard.findUnique).toHaveBeenCalled();
    });

    it('should return 404 for dashboard of different tenant', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'Dashboard 1',
        tenantId: 'other-tenant',
        widgets: [],
      });

      const response = await request(app.getHttpServer())
        .get('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('PUT /dashboards/:id', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'Old Title',
        tenantId: mockTenantId,
        widgets: [],
      });
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        title: 'New Title',
        tenantId: mockTenantId,
        widgets: [],
      });

      const response = await request(app.getHttpServer())
        .put('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Title' })
        .expect(200);

      expect(response.body).toHaveProperty('title', 'New Title');
      expect(prisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dash-1' },
          data: expect.objectContaining({ title: 'New Title' }),
        }),
      );
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should delete a dashboard as admin', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'To Delete',
        tenantId: mockTenantId,
        widgets: [],
      });
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await request(app.getHttpServer())
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(prisma.dashboard.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'dash-1' } }),
      );
    });

    it('should reject delete for viewer role', async () => {
      const viewerToken = jwtService.sign({
        sub: 'user-2',
        email: 'viewer@example.com',
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
  });
});
