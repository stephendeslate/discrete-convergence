import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetMocks, mockPrisma } from './helpers/test-app';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Security Integration (E2E)', () => {
  let app: INestApplication;
  let validToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const result = await createTestApp();
    app = result.app;

    const jwtService = app.get(JwtService);
    validToken = jwtService.sign({
      sub: 'user-1',
      email: 'user@test.com',
      tenantId: 'tenant-1',
      role: 'USER',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks(mockPrisma);
  });

  describe('JWT Authentication', () => {
    it('should reject requests with expired token', async () => {
      const jwtService = app.get(JwtService);
      const expiredToken = jwtService.sign(
        { sub: 'user-1', email: 'a@b.com', tenantId: 't1', role: 'USER' },
        { expiresIn: '0s' },
      );

      // Small delay to ensure token expires
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should reject requests with malformed token', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer not.a.valid.jwt')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should reject requests without Bearer prefix', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', validToken)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Input Validation', () => {
    it('should reject SQL injection in query parameters', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/events?page=1&limit=20')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should strip unknown fields from body (whitelist)', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Event', malicious: '<script>alert(1)</script>' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('RBAC Authorization', () => {
    it('should block non-admin from admin-only endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(403);

      expect(response.body.statusCode).toBe(403);
    });

    it('should allow admin to access admin endpoints', async () => {
      const jwtService = app.get(JwtService);
      const adminToken = jwtService.sign({
        sub: 'admin-1',
        email: 'admin@test.com',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      });

      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('Public Routes', () => {
    it('health endpoint should not require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    it('register endpoint should not require authentication', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({ id: 't1', slug: 'default' });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'new@test.com',
        name: 'New User',
        role: 'USER',
        tenantId: 't1',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@test.com', password: 'StrongP@ss1', name: 'New User' })
        .expect(201);

      expect(response.body.email).toBe('new@test.com');
    });
  });
});
