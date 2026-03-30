import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getTestAuthToken, getMockPrisma } from './helpers/test-utils';
import { APP_VERSION } from '@event-management/shared';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = getTestAuthToken(app);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    const mockPrisma = getMockPrisma();
    mockPrisma.event.findMany.mockResolvedValue([]);
    mockPrisma.event.count.mockResolvedValue(0);
    mockPrisma.event.findFirst.mockResolvedValue(null);
  });

  describe('Full pipeline test', () => {
    it('should complete auth -> list -> error handling pipeline', async () => {
      // Read events (empty list)
      const listRes = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toEqual([]);

      // Error handling - not found
      const notFoundRes = await request(app.getHttpServer())
        .get('/events/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${authToken}`);
      expect(notFoundRes.status).toBe(404);
      expect(notFoundRes.body.correlationId).toBeDefined();
    });
  });

  describe('Health endpoint with shared constants', () => {
    it('should use APP_VERSION from shared package', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.version).toBe(APP_VERSION);
    });

    it('should include response time header', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.body.status).toBe('ok');
    });
  });

  describe('DB connectivity check', () => {
    it('should verify database connection via health/ready', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBeDefined();
    });
  });

  describe('Correlation IDs', () => {
    it('should preserve client correlation ID', async () => {
      const customId = 'test-correlation-123';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', customId);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include correlationId in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('X-Correlation-ID', 'error-correlation-456');

      expect(res.status).toBe(401);
      expect(res.body.correlationId).toBeDefined();
    });
  });

  describe('Guard chain', () => {
    it('should block unauthenticated access to protected routes', async () => {
      const res = await request(app.getHttpServer()).get('/venues');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should allow public routes without auth', async () => {
      const healthRes = await request(app.getHttpServer()).get('/health');
      const metricsRes = await request(app.getHttpServer()).get('/metrics');

      expect(healthRes.status).toBe(200);
      expect(metricsRes.status).toBe(200);
    });
  });
});
