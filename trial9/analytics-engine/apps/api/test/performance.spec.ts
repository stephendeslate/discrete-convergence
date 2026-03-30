import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MAX_PAGE_SIZE } from '@analytics-engine/shared';
import type { Server } from 'http';
import { createTestApp, createMockPrismaService, generateTestToken } from './helpers/test-utils';

describe('Performance', () => {
  let app: INestApplication;
  let server: Server;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;
  let authToken: string;

  beforeAll(async () => {
    mockPrisma = createMockPrismaService();
    app = await createTestApp(mockPrisma);
    server = app.getHttpServer() as Server;

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'perf-user',
      email: 'perf@test.com',
      role: 'ADMIN',
      tenantId: 'perf-tenant',
    });

    authToken = generateTestToken(app, {
      sub: 'perf-user',
      email: 'perf@test.com',
      role: 'ADMIN',
      tenantId: 'perf-tenant',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED: AE-PERF-006
  describe('Response time headers', () => {
    it('should include X-Response-Time header on all responses', async () => {
      const res = await request(server)
        .get('/health')
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });

    it('should include X-Response-Time on authenticated endpoints', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(server)
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });
  });

  describe('Pagination', () => {
    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(server)
        .get('/dashboards?page=1&pageSize=500')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.pageSize).toBe(MAX_PAGE_SIZE);
      expect(res.body).toHaveProperty('total');
    });

    it('should use default page size when not specified', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(server)
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.pageSize).toBe(20);
      expect(res.body).toHaveProperty('data');
    });

    it('should handle negative page numbers gracefully', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(server)
        .get('/dashboards?page=-1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.page).toBe(1);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('Cache-Control headers', () => {
    it('should include Cache-Control on list endpoints', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const res = await request(server)
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.headers['cache-control']).toContain('max-age');
      expect(res.body).toHaveProperty('data');
    });

    it('should include Cache-Control on widgets list', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([]);
      mockPrisma.widget.count.mockResolvedValue(0);

      const res = await request(server)
        .get('/widgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.headers['cache-control']).toContain('max-age');
      expect(res.body).toHaveProperty('data');
    });
  });
});
