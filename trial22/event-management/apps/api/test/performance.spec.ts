import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetMocks, mockPrisma } from './helpers/test-app';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Performance Integration (E2E)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const result = await createTestApp();
    app = result.app;

    const jwtService = app.get(JwtService);
    token = jwtService.sign({
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

  describe('Response Time', () => {
    it('should respond within acceptable time for health check', async () => {
      const start = Date.now();

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000);
      expect(response.body.status).toBe('ok');
    });

    it('should include X-Response-Time header on all responses', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const responseTime = response.headers['x-response-time'];
      expect(responseTime).toBeDefined();
      expect(responseTime).toMatch(/^\d+(\.\d+)?ms$/);
    });
  });

  describe('Pagination Limits', () => {
    it('should reject page size exceeding MAX_PAGE_SIZE', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?page=1&limit=10000')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should handle default pagination parameters', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('Cache Control', () => {
    it('should include Cache-Control header on cacheable GET responses', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.headers['cache-control']).toBeDefined();
    });
  });
});
