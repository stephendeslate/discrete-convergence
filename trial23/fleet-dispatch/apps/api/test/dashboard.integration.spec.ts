import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  createTestApp,
  generateToken,
  PrismaMock,
  TEST_USER,
} from './helpers/test-app';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaMock;
  let token: string;

  const mockDashboard = {
    id: 'dash-001',
    name: 'Operations Overview',
    description: 'Main dispatch dashboard',
    layout: { columns: 2, rows: 3 },
    visibility: 'PRIVATE',
    companyId: 'company-001',
    userId: 'user-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    module = ctx.module;
    prisma = ctx.prisma;
    token = generateToken(module, TEST_USER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /dashboards', () => {
    it('should create a dashboard with valid data', async () => {
      prisma.dashboard.create.mockResolvedValue(mockDashboard);

      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Operations Overview',
          description: 'Main dispatch dashboard',
          layout: { columns: 2, rows: 3 },
          visibility: 'PRIVATE',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'dash-001');
      expect(res.body).toHaveProperty('name', 'Operations Overview');
    });

    it('should return 400 for missing name', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No name provided' })
        .expect(400);
    });
  });

  describe('GET /dashboards', () => {
    it('should return paginated list of dashboards', async () => {
      prisma.dashboard.findMany.mockResolvedValue([mockDashboard]);
      prisma.dashboard.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should return a single dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(mockDashboard);

      const res = await request(app.getHttpServer())
        .get('/dashboards/dash-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', 'dash-001');
      expect(res.body).toHaveProperty('layout');
    });
  });

  describe('PUT /dashboards/:id', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(mockDashboard);
      prisma.dashboard.update.mockResolvedValue({
        ...mockDashboard,
        name: 'Updated Dashboard',
      });

      const res = await request(app.getHttpServer())
        .put('/dashboards/dash-001')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Dashboard' })
        .expect(200);

      expect(res.body).toHaveProperty('name', 'Updated Dashboard');
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should delete a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(mockDashboard);
      prisma.dashboard.delete.mockResolvedValue(mockDashboard);

      await request(app.getHttpServer())
        .delete('/dashboards/dash-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 for non-existent dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/dashboards/nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Authentication', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });

    it('should include X-Response-Time header', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });
  });
});
