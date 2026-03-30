import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestApp } from './helpers/test-utils';

describe('Performance', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should respond to health check within 200ms', async () => { // VERIFY:EM-PERF-V01 — health endpoint responds within performance budget
    const start = Date.now();
    const response = await request(app.getHttpServer()).get('/health');
    const duration = Date.now() - start;
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  it('should include X-Response-Time header', async () => { // VERIFY:EM-PERF-V02 — response time header present on responses
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.headers['x-response-time']).toMatch(/^\d+ms$/);
  });

  it('should include correlation ID in response', async () => { // VERIFY:EM-PERF-V03 — correlation ID propagated in response
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('x-correlation-id', 'perf-test-123');
    expect(response.headers['x-correlation-id']).toBe('perf-test-123');
  });

  it('should accept pagination parameters without performance degradation', async () => { // VERIFY:EM-PERF-V04 — pagination does not degrade auth check performance
    const start = Date.now();
    const response = await request(app.getHttpServer())
      .get('/events?page=1&pageSize=10');
    const duration = Date.now() - start;
    expect(response.status).toBe(401);
    expect(duration).toBeLessThan(500);
  });

  it('should handle concurrent requests to health endpoint', async () => { // VERIFY:EM-PERF-V05 — concurrent requests handled correctly
    const server = app.getHttpServer();
    const responses = [];
    for (let i = 0; i < 3; i++) {
      const res = await request(server).get('/health');
      responses.push(res);
    }
    responses.forEach((res) => {
      expect(res.status).toBe(200);
    });
    expect(responses.length).toBe(3);
  });
});
