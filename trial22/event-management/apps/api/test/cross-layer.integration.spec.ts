import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetMocks, mockPrisma } from './helpers/test-app';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Cross-Layer Integration (E2E)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const result = await createTestApp();
    app = result.app;

    const jwtService = app.get(JwtService);
    userToken = jwtService.sign({
      sub: 'user-1',
      email: 'user@test.com',
      tenantId: 'tenant-1',
      role: 'USER',
    });
    adminToken = jwtService.sign({
      sub: 'admin-1',
      email: 'admin@test.com',
      tenantId: 'tenant-1',
      role: 'ADMIN',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks(mockPrisma);
  });

  describe('Auth -> Protected Resource Flow', () => {
    it('should access events with valid token', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.total).toBe(0);
    });

    it('should reject access without token across all protected routes', async () => {
      const protectedRoutes = ['/events', '/venues', '/tickets', '/attendees'];

      for (const route of protectedRoutes) {
        const response = await request(app.getHttpServer())
          .get(route)
          .expect(401);

        expect(response.body.statusCode).toBe(401);
      }
    });
  });

  describe('RBAC Enforcement', () => {
    it('should allow admin to access audit logs', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should deny non-admin access to audit logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.statusCode).toBe(403);
    });
  });

  describe('Validation Pipeline', () => {
    it('should reject invalid event creation data', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ invalidField: 'bad' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should accept valid event creation data', async () => {
      mockPrisma.event.create.mockResolvedValue({
        id: 'e1',
        title: 'Valid Event',
        tenantId: 'tenant-1',
      });

      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Valid Event', startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-02T00:00:00Z' })
        .expect(201);

      expect(response.body.title).toBe('Valid Event');
    });
  });

  describe('Response Structure', () => {
    it('should include correlation ID in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .set('X-Correlation-ID', 'test-corr-123')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.correlationId).toBe('test-corr-123');
    });
  });
});
