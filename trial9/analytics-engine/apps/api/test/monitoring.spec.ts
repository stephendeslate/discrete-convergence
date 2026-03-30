import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { APP_VERSION } from '@analytics-engine/shared';
import type { Server } from 'http';
import { createTestApp, createMockPrismaService } from './helpers/test-utils';

describe('Monitoring', () => {
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

  // TRACED: AE-MON-012
  describe('GET /health', () => {
    it('should return health status with version', async () => {
      const res = await request(server).get('/health').expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('version', APP_VERSION);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });

    it('should be accessible without authentication', async () => {
      const res = await request(server).get('/health').expect(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.version).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should return database readiness status', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const res = await request(server).get('/health/ready').expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should confirm database connectivity', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const res = await request(server).get('/health/ready').expect(200);
      expect(res.body.database).toBe('connected');
      expect(res.body.status).toBe('ready');
    });
  });

  describe('GET /metrics', () => {
    it('should return application metrics', async () => {
      const res = await request(server).get('/metrics').expect(200);

      expect(res.body).toHaveProperty('requestCount');
      expect(res.body).toHaveProperty('errorCount');
      expect(res.body).toHaveProperty('averageResponseTime');
      expect(res.body).toHaveProperty('uptime');
    });

    it('should return numeric metric values', async () => {
      const res = await request(server).get('/metrics').expect(200);
      expect(typeof res.body.requestCount).toBe('number');
      expect(typeof res.body.uptime).toBe('number');
    });
  });

  describe('Correlation IDs', () => {
    it('should preserve client-provided correlation ID', async () => {
      const correlationId = 'test-correlation-123';
      const res = await request(server)
        .get('/health')
        .set('X-Correlation-ID', correlationId)
        .expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should include correlation ID in error responses', async () => {
      const res = await request(server)
        .get('/dashboards')
        .set('X-Correlation-ID', 'err-corr-id')
        .expect(401);

      expect(res.body).toHaveProperty('correlationId');
      expect(res.body.correlationId).toBeDefined();
    });
  });
});
