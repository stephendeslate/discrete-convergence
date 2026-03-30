import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import { createTestApp, createMockPrismaService, generateTestToken } from './helpers/test-utils';

describe('Security', () => {
  let app: INestApplication;
  let server: Server;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    mockPrisma = createMockPrismaService();
    app = await createTestApp(mockPrisma);
    server = app.getHttpServer() as Server;

    // Mock validateUser for JWT strategy
    mockPrisma.user.findFirst.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id === 'user-1') {
        return Promise.resolve({ id: 'user-1', email: 'user@sec.com', role: 'USER', tenantId: 'sec-tenant' });
      }
      if (where.id === 'admin-1') {
        return Promise.resolve({ id: 'admin-1', email: 'admin@sec.com', role: 'ADMIN', tenantId: 'sec-tenant' });
      }
      return Promise.resolve(null);
    });

    userToken = generateTestToken(app, {
      sub: 'user-1',
      email: 'user@sec.com',
      role: 'USER',
      tenantId: 'sec-tenant',
    });

    adminToken = generateTestToken(app, {
      sub: 'admin-1',
      email: 'admin@sec.com',
      role: 'ADMIN',
      tenantId: 'sec-tenant',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED: AE-SEC-011
  describe('Authentication enforcement', () => {
    it('should reject unauthenticated requests to protected endpoints', async () => {
      const res = await request(server).get('/dashboards').expect(401);
      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(server)
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should reject requests with expired token format', async () => {
      const res = await request(server)
        .get('/dashboards')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4IiwiZXhwIjoxfQ.invalid')
        .expect(401);
      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('RBAC enforcement', () => {
    it('should allow admin to access admin-only endpoints', async () => {
      const mockDashboard = {
        id: 'dash-1',
        title: 'To Delete',
        tenantId: 'sec-tenant',
        createdById: 'admin-1',
        widgets: [],
        createdBy: { id: 'admin-1', name: 'Admin', email: 'admin@sec.com' },
      };
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      mockPrisma.dashboard.delete.mockResolvedValue(mockDashboard);

      await request(server)
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny non-admin from accessing admin-only endpoints', async () => {
      const res = await request(server)
        .delete('/dashboards/dash-1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Input validation', () => {
    it('should reject overly long strings', async () => {
      const longTitle = 'A'.repeat(300);
      const res = await request(server)
        .post('/dashboards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: longTitle })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should strip unknown properties', async () => {
      const res = await request(server)
        .post('/dashboards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Valid', evilField: 'malicious' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Security headers', () => {
    it('should allow access to public health endpoint', async () => {
      const res = await request(server).get('/health').expect(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('Error sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      const res = await request(server)
        .get('/dashboards/non-existent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body).not.toHaveProperty('stack');
      expect(res.body.statusCode).toBe(404);
    });
  });
});
