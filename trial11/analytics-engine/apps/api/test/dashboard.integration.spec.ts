import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let adminToken: string;

  const mockPrisma = {
    user: { findFirst: jest.fn(), create: jest.fn() },
    dashboard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    dataSource: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
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
    userToken = jwtService.sign({ sub: 'user-1', email: 'user@test.com', role: 'USER', tenantId: 'tenant-001' });
    adminToken = jwtService.sign({ sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN', tenantId: 'tenant-001' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /dashboards', () => {
    it('should create a dashboard', async () => {
      mockPrisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        name: 'Test Dashboard',
        description: 'A test',
        isPublic: false,
        userId: 'user-1',
        tenantId: 'tenant-001',
        widgets: [],
      });

      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test Dashboard', description: 'A test' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Dashboard');
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Test Dashboard', tenantId: 'tenant-001' }),
        }),
      );
    });

    it('should reject dashboard creation without auth', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should reject dashboard with missing name', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ description: 'No name' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('GET /dashboards', () => {
    it('should return paginated dashboards', async () => {
      const mockDashboards = [
        { id: 'dash-1', name: 'Dashboard 1', tenantId: 'tenant-001', widgets: [] },
        { id: 'dash-2', name: 'Dashboard 2', tenantId: 'tenant-001', widgets: [] },
      ];
      mockPrisma.dashboard.findMany.mockResolvedValue(mockDashboards);
      mockPrisma.dashboard.count.mockResolvedValue(2);

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-001' },
        }),
      );
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should return a specific dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        name: 'Dashboard 1',
        tenantId: 'tenant-001',
        widgets: [],
      });

      const res = await request(app.getHttpServer())
        .get('/dashboards/dash-1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Dashboard 1');
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dash-1', tenantId: 'tenant-001' },
        }),
      );
    });

    it('should return 404 for non-existent dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/dashboards/nonexistent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Dashboard not found');
    });
  });

  describe('PUT /dashboards/:id', () => {
    it('should update a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        name: 'Old Name',
        tenantId: 'tenant-001',
        widgets: [],
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        name: 'Updated Name',
        tenantId: 'tenant-001',
        widgets: [],
      });

      const res = await request(app.getHttpServer())
        .put('/dashboards/dash-1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(mockPrisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dash-1' },
        }),
      );
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should delete a dashboard with admin role', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-001',
        widgets: [],
      });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      const res = await request(app.getHttpServer())
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
    });

    it('should reject delete for non-admin users', async () => {
      const res = await request(app.getHttpServer())
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.statusCode).toBe(403);
    });

    it('should reject delete without authentication', async () => {
      const res = await request(app.getHttpServer())
        .delete('/dashboards/dash-1');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });
});
