import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getTestAuthToken } from './helpers/test-utils';

describe('Performance Integration', () => {
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

  describe('Response time headers', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on protected endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should format response time in milliseconds', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.headers['x-response-time']).toMatch(/ms$/);
      const timeValue = parseFloat(res.headers['x-response-time'].replace('ms', ''));
      expect(timeValue).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should reject page size exceeding MAX_PAGE_SIZE via validation', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?limit=999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should default to page 1 with DEFAULT_PAGE_SIZE', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(20);
    });

    it('should handle custom page parameters', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(5);
    });
  });

  describe('Cache headers', () => {
    it('should respond within reasonable time for list endpoints', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(5000);
    });
  });
});
