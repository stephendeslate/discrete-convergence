import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /health', () => {
    it('should return health status without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should include timestamp and uptime', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.body.timestamp).toBeDefined();
      expect(typeof res.body.uptime).toBe('number');
    });

    it('should include version from shared', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.body.version).toBeDefined();
      expect(res.body.version).toBe('1.0.0');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBeDefined();
    });

    it('should check database connectivity', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.body.database).toBeDefined();
      expect(['connected', 'disconnected']).toContain(res.body.database);
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics without auth', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');

      expect(res.status).toBe(200);
      expect(typeof res.body.requestCount).toBe('number');
    });

    it('should include error count and uptime', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');

      expect(typeof res.body.errorCount).toBe('number');
      expect(typeof res.body.uptime).toBe('number');
    });

    it('should include average response time', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');

      expect(typeof res.body.averageResponseTime).toBe('number');
      expect(res.body.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });
});
