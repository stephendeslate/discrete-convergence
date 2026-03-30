import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, createMockPrismaService, generateTestToken } from './helpers/test-utils';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let server: Server;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;
  let authToken: string;
  const tenantId = 'tenant-integration';

  beforeAll(async () => {
    mockPrisma = createMockPrismaService();
    app = await createTestApp(mockPrisma);
    server = app.getHttpServer() as Server;

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'dash-user',
      email: 'dash-test@test.com',
      role: 'ADMIN',
      tenantId,
    });

    authToken = generateTestToken(app, {
      sub: 'dash-user',
      email: 'dash-test@test.com',
      role: 'ADMIN',
      tenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-set the user mock since clearAllMocks clears it
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'dash-user',
      email: 'dash-test@test.com',
      role: 'ADMIN',
      tenantId,
    });
  });

  // TRACED: AE-DASH-003
  describe('POST /dashboards', () => {
    it('should create a dashboard', async () => {
      mockPrisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        title: 'Test Dashboard',
        description: 'A test',
        status: 'DRAFT',
        tenantId,
        createdById: 'dash-user',
        widgets: [],
      });

      const res = await request(server)
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Dashboard', description: 'A test' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Dashboard');
      expect(res.body.tenantId).toBe(tenantId);
    });

    it('should reject dashboard without title', async () => {
      const res = await request(server)
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(server)
        .post('/dashboards')
        .send({ title: 'Test' })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('GET /dashboards', () => {
    it('should return paginated dashboards', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([
        { id: 'dash-1', title: 'Dash 1', tenantId, widgets: [], createdBy: { id: 'dash-user', name: 'User', email: 'dash-test@test.com' } },
      ]);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const res = await request(server)
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.headers['cache-control']).toContain('max-age');
    });

    it('should respect page size parameter', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([
        { id: 'dash-1', title: 'Dash 0', tenantId },
        { id: 'dash-2', title: 'Dash 1', tenantId },
      ]);
      mockPrisma.dashboard.count.mockResolvedValue(3);

      const res = await request(server)
        .get('/dashboards?page=1&pageSize=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.length).toBe(2);
      expect(res.body.pageSize).toBe(2);
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should return a specific dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'Get Test',
        tenantId,
        widgets: [],
        createdBy: { id: 'dash-user', name: 'User', email: 'test@test.com' },
      });

      const res = await request(server)
        .get('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe('dash-1');
      expect(res.body.title).toBe('Get Test');
    });

    it('should return 404 for non-existent dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      const res = await request(server)
        .get('/dashboards/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('PUT /dashboards/:id', () => {
    it('should update a dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'Before Update',
        tenantId,
        widgets: [],
        createdBy: { id: 'dash-user', name: 'User', email: 'test@test.com' },
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        title: 'After Update',
        tenantId,
        widgets: [],
      });

      const res = await request(server)
        .put('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'After Update' })
        .expect(200);

      expect(res.body.title).toBe('After Update');
      expect(res.body.id).toBe('dash-1');
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should delete a dashboard (admin only)', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'To Delete',
        tenantId,
        widgets: [],
        createdBy: { id: 'dash-user', name: 'User', email: 'test@test.com' },
      });
      mockPrisma.dashboard.delete.mockResolvedValue({
        id: 'dash-1',
        title: 'To Delete',
        tenantId,
      });

      await request(server)
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
      });
    });
  });
});
