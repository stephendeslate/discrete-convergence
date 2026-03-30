import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Performance Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include X-Response-Time header on health endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toMatch(/\d+ms/);
  });

  it('should include X-Response-Time header on metrics endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toMatch(/\d+ms/);
  });

  it('should respond to health check under 200ms', async () => {
    const start = Date.now();
    const res = await request(app.getHttpServer()).get('/health');
    const duration = Date.now() - start;
    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  it('should include X-Correlation-ID on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-correlation-id']).toBeDefined();
    expect(typeof res.headers['x-correlation-id']).toBe('string');
  });

  it('should handle rapid sequential requests to health', async () => {
    const results = [];
    for (let i = 0; i < 10; i++) {
      const res = await request(app.getHttpServer()).get('/health');
      results.push(res);
    }
    const all200 = results.every((r) => r.status === 200);
    expect(all200).toBe(true);
    expect(results.length).toBe(10);
  });

  it('should return 401 for unauthenticated vehicle list (not 500)', async () => {
    const res = await request(app.getHttpServer()).get('/vehicles');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });
});
