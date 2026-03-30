import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers/test-app';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof import('./helpers/test-app')['buildMockPrismaService']>['prisma'];
  let token: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    token = generateTestToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.dashboard.findFirst.mockResolvedValue({
      id: 'dash-uuid-001',
      name: 'Test Dashboard',
      description: 'A test dashboard',
      status: 'DRAFT',
      organizationId: 'org-uuid-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.dashboard.findMany.mockResolvedValue([
      {
        id: 'dash-uuid-001',
        name: 'Test Dashboard',
        description: 'A test dashboard',
        status: 'DRAFT',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.dashboard.count.mockResolvedValue(1);
  });

  function authGet(path: string) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function authPost(path: string) {
    return request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function authPatch(path: string) {
    return request(app.getHttpServer())
      .patch(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function authDelete(path: string) {
    return request(app.getHttpServer())
      .delete(path)
      .set('Authorization', `Bearer ${token}`);
  }

  describe('POST /dashboards', () => {
    it('should create a dashboard', async () => {
      prisma.dashboard.create.mockResolvedValueOnce({
        id: 'dash-new-001',
        name: 'Analytics Dashboard',
        description: 'Real-time analytics',
        status: 'DRAFT',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authPost('/dashboards')
        .send({ name: 'Analytics Dashboard', description: 'Real-time analytics' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Analytics Dashboard');
      expect(res.body.status).toBe('DRAFT');
    });

    it('should reject dashboard with invalid data (missing name) with 400', async () => {
      const res = await authPost('/dashboards')
        .send({ description: 'No name provided' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('GET /dashboards', () => {
    it('should return list of dashboards', async () => {
      const res = await authGet('/dashboards').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should return a single dashboard', async () => {
      const res = await authGet('/dashboards/dash-uuid-001').expect(200);

      expect(res.body.id).toBe('dash-uuid-001');
      expect(res.body.name).toBe('Test Dashboard');
    });

    it('should return 404 for non-existent dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValueOnce(null);

      const res = await authGet('/dashboards/00000000-0000-0000-0000-000000000000').expect(404);

      expect(res.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /dashboards/:id', () => {
    it('should update dashboard', async () => {
      prisma.dashboard.update.mockResolvedValueOnce({
        id: 'dash-uuid-001',
        name: 'Updated Dashboard',
        description: 'A test dashboard',
        status: 'DRAFT',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authPatch('/dashboards/dash-uuid-001')
        .send({ name: 'Updated Dashboard' })
        .expect(200);

      expect(res.body.name).toBe('Updated Dashboard');
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should archive dashboard (soft delete)', async () => {
      prisma.dashboard.update.mockResolvedValueOnce({
        id: 'dash-uuid-001',
        name: 'Test Dashboard',
        description: 'A test dashboard',
        status: 'ARCHIVED',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authDelete('/dashboards/dash-uuid-001').expect(200);

      expect(res.body.status).toBe('ARCHIVED');
    });
  });
});
