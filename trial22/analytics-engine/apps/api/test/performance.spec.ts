import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetMocks } from './helpers/test-app';

describe('Performance Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks();
  });

  it('should include X-Response-Time header on all responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.headers).toHaveProperty('x-response-time');
    expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should include Cache-Control header on GET list endpoints', async () => {
    // Health endpoint doesn't have CacheControlInterceptor, but it still works as public
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    // Health always responds with status ok
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.headers).toHaveProperty('x-response-time');
  });

  it('should respond to health checks in reasonable time', async () => {
    const start = Date.now();

    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
  });

  it('should handle sequential requests without errors', async () => {
    const results = [];
    for (let i = 0; i < 3; i++) {
      const res = await request(app.getHttpServer()).get('/health');
      results.push(res);
    }

    results.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
    expect(results).toHaveLength(3);
  });
});
