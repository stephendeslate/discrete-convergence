// TRACED:TEST-PERFORMANCE — Performance and response time tests
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

  it('should handle multiple sequential requests', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    }
  });

  it('should handle concurrent health check requests', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer()).get('/health');
      statuses.push(res.status);
    }
    expect(statuses.every((s) => s === 200)).toBe(true);
    expect(statuses).toHaveLength(5);
  });

  it('should reject unauthenticated requests quickly', async () => {
    const start = Date.now();
    const res = await request(app.getHttpServer()).get('/vehicles');
    const elapsed = Date.now() - start;
    expect(res.status).toBe(401);
    expect(elapsed).toBeLessThan(200);
  });
});
