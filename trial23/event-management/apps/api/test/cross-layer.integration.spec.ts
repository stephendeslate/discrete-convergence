import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers/test-app';

describe('Cross-Layer Integration', () => {
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
    // Restore defaults for entity lookups
    prisma.event.findFirst.mockResolvedValue({
      id: 'event-uuid-001',
      name: 'Test Event',
      description: 'A test event',
      startDate: new Date('2026-06-01T10:00:00.000Z'),
      endDate: new Date('2026-06-01T18:00:00.000Z'),
      status: 'DRAFT',
      venueId: null,
      organizationId: 'org-uuid-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.event.findMany.mockResolvedValue([]);
    prisma.event.count.mockResolvedValue(0);
    prisma.dataSource.findFirst.mockResolvedValue({
      id: 'ds-uuid-001',
      name: 'Test DS',
      type: 'POSTGRESQL',
      config: { host: 'localhost' },
      status: 'ACTIVE',
      lastSyncAt: null,
      organizationId: 'org-uuid-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.dashboard.findFirst.mockResolvedValue({
      id: 'dash-uuid-001',
      name: 'Test Dashboard',
      description: null,
      status: 'DRAFT',
      organizationId: 'org-uuid-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.dashboard.findMany.mockResolvedValue([]);
    prisma.dashboard.count.mockResolvedValue(0);
  });

  describe('Correlation ID', () => {
    it('should propagate correlation ID from request header', async () => {
      const correlationId = 'test-corr-id-12345';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId)
        .expect(200);

      expect(res.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should generate correlation ID when not provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(typeof res.headers['x-correlation-id']).toBe('string');
      expect(res.headers['x-correlation-id'].length).toBeGreaterThan(0);
    });
  });

  describe('Response time header', () => {
    it('should include X-Response-Time header on responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });
  });

  describe('Pagination clamping', () => {
    it('should clamp page < 1 to page 1', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?page=0&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.page).toBe(1);
    });

    it('should clamp limit > MAX_PAGE_SIZE to MAX_PAGE_SIZE', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?page=1&limit=500')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('Data source sync endpoint', () => {
    it('should trigger data source sync and record history', async () => {
      prisma.dataSource.update.mockResolvedValueOnce({
        id: 'ds-uuid-001',
        name: 'Test DS',
        type: 'POSTGRESQL',
        config: { host: 'localhost' },
        status: 'ACTIVE',
        lastSyncAt: new Date(),
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.syncHistory.create.mockResolvedValueOnce({
        id: 'sync-new-001',
        dataSourceId: 'ds-uuid-001',
        status: 'SUCCESS',
        startedAt: new Date(),
        completedAt: new Date(),
        organizationId: 'org-uuid-001',
      });

      const res = await request(app.getHttpServer())
        .post('/data-sources/ds-uuid-001/sync')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body).toHaveProperty('status');
      expect(res.body.dataSourceId).toBe('ds-uuid-001');
    });
  });

  describe('Dashboard CRUD through API', () => {
    it('should create and retrieve a dashboard', async () => {
      prisma.dashboard.create.mockResolvedValueOnce({
        id: 'dash-new-cross',
        name: 'Cross-Layer Dashboard',
        description: 'Testing cross-layer',
        status: 'DRAFT',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cross-Layer Dashboard', description: 'Testing cross-layer' })
        .expect(201);

      expect(createRes.body.name).toBe('Cross-Layer Dashboard');

      prisma.dashboard.findFirst.mockResolvedValueOnce({
        id: 'dash-new-cross',
        name: 'Cross-Layer Dashboard',
        description: 'Testing cross-layer',
        status: 'DRAFT',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const getRes = await request(app.getHttpServer())
        .get('/dashboards/dash-new-cross')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getRes.body.id).toBe('dash-new-cross');
    });
  });

  describe('Organization-scoped data isolation', () => {
    it('should scope event queries to the authenticated user organization', async () => {
      await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-uuid-001',
          }),
        }),
      );
    });

    it('should scope venue queries to the authenticated user organization', async () => {
      prisma.venue.findMany.mockResolvedValueOnce([]);
      prisma.venue.count.mockResolvedValueOnce(0);

      await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(prisma.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-uuid-001',
          }),
        }),
      );
    });
  });
});
