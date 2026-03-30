// TRACED:TEST-PERFORMANCE — Performance and response timing tests
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Performance (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should respond to health check within 200ms', async () => {
    const start = Date.now();
    const res = await request(app.getHttpServer()).get('/health');
    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(200);
  });

  it('should handle 20 sequential requests within 5s', async () => {
    const start = Date.now();
    for (let i = 0; i < 20; i++) {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  it('should handle multiple rapid health checks', async () => {
    const start = Date.now();
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) {
      const res = await request(app.getHttpServer()).get('/health');
      statuses.push(res.status);
    }
    const duration = Date.now() - start;

    expect(statuses.every((s) => s === 200)).toBe(true);
    expect(duration).toBeLessThan(2000);
  });

  it('health ready endpoint should respond within 200ms', async () => {
    const start = Date.now();
    const res = await request(app.getHttpServer()).get('/health/ready');
    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(200);
  });
});
