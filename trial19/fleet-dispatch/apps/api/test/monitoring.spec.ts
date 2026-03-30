import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Monitoring Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health — should return ok status', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.version).toBeDefined();
  });

  it('GET /health — should include uptime', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /health/ready — should check database connectivity', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('database');
  });

  it('GET /metrics — should return request counts', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requestCount');
    expect(res.body).toHaveProperty('errorCount');
    expect(res.body).toHaveProperty('uptime');
  });

  it('GET /health — should not require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /health — should include X-Response-Time header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('GET /health — should include X-Correlation-ID header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('GET /health — should preserve client correlation ID', async () => {
    const clientCorrelationId = 'test-correlation-123';
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', clientCorrelationId);
    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBe(clientCorrelationId);
  });
});
