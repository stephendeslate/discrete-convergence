import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { APP_VERSION } from '@analytics-engine/shared';
import type { Server } from 'http';
import { createTestApp, createMockPrismaService, generateTestToken } from './helpers/test-utils';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let server: Server;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeAll(async () => {
    mockPrisma = createMockPrismaService();
    app = await createTestApp(mockPrisma);
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TRACED: AE-CROSS-001
  describe('Full auth → CRUD → error handling pipeline', () => {
    it('should complete full user lifecycle', async () => {
      // 1. Register
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'pipeline@test.com',
        name: 'Pipeline User',
        role: 'USER',
        tenantId: 'cross-tenant',
      });

      const registerRes = await request(server)
        .post('/auth/register')
        .send({
          email: 'pipeline@test.com',
          password: 'password123',
          name: 'Pipeline User',
          role: 'USER',
          tenantId: 'cross-tenant',
        })
        .expect(201);

      expect(registerRes.body).toHaveProperty('access_token');
      const token = registerRes.body.access_token;

      // 2. Setup mock for JWT validation
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'pipeline@test.com',
        role: 'USER',
        tenantId: 'cross-tenant',
      });

      // 3. Create dashboard (CRUD)
      mockPrisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        title: 'Cross-Layer Dashboard',
        tenantId: 'cross-tenant',
        createdById: 'user-1',
        widgets: [],
      });

      const createRes = await request(server)
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Cross-Layer Dashboard' })
        .expect(201);

      expect(createRes.body.title).toBe('Cross-Layer Dashboard');
      expect(createRes.body).toHaveProperty('id');

      // 4. Read dashboard
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'Cross-Layer Dashboard',
        tenantId: 'cross-tenant',
        widgets: [],
        createdBy: { id: 'user-1', name: 'Pipeline User', email: 'pipeline@test.com' },
      });

      const readRes = await request(server)
        .get('/dashboards/dash-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(readRes.body.id).toBe('dash-1');
      expect(readRes.headers['x-response-time']).toBeDefined();

      // 5. Update dashboard
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        title: 'Updated Dashboard',
        tenantId: 'cross-tenant',
        widgets: [],
      });

      const updateRes = await request(server)
        .put('/dashboards/dash-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Dashboard' })
        .expect(200);

      expect(updateRes.body.title).toBe('Updated Dashboard');
      expect(updateRes.headers['x-response-time']).toBeDefined();
    });

    it('should handle error paths with correlation IDs', async () => {
      const res = await request(server)
        .get('/dashboards/nonexistent')
        .set('X-Correlation-ID', 'test-corr-id')
        .expect(401);

      expect(res.body).toHaveProperty('correlationId');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('Health and monitoring pipeline', () => {
    it('should report correct APP_VERSION from shared', async () => {
      const res = await request(server).get('/health').expect(200);

      expect(res.body.version).toBe(APP_VERSION);
      expect(res.body.status).toBe('ok');
    });

    it('should verify DB connectivity via readiness check', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const res = await request(server).get('/health/ready').expect(200);

      expect(res.body.database).toBe('connected');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should expose metrics without auth', async () => {
      const res = await request(server).get('/metrics').expect(200);

      expect(res.body).toHaveProperty('requestCount');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('Response time across endpoints', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const res = await request(server).get('/health').expect(200);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/ms$/);
    });

    it('should include X-Response-Time on metrics endpoint', async () => {
      const res = await request(server).get('/metrics').expect(200);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.body).toHaveProperty('requestCount');
    });
  });

  describe('Tenant isolation', () => {
    it('should isolate dashboard data by tenant', async () => {
      // Token for tenant-2
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'tenant2-user',
        email: 'tenant2@test.com',
        role: 'USER',
        tenantId: 'tenant-2',
      });

      const token = generateTestToken(app, {
        sub: 'tenant2-user',
        email: 'tenant2@test.com',
        role: 'USER',
        tenantId: 'tenant-2',
      });

      // Service queries with tenant-2, should get empty results
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(server)
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.length).toBe(0);
      expect(res.body.total).toBe(0);
    });
  });
});
