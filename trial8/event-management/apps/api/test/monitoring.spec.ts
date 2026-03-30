import request from 'supertest';
import { createTestApp } from './helpers/test-setup';
import { INestApplication } from '@nestjs/common';

// TRACED: EM-TEST-012 — Monitoring and health endpoint tests

describe('Monitoring & Health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 with status "ok" from GET /health', async () => {
    // TRACED: EM-MON-001
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version');
    expect(typeof res.body.version).toBe('string');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 200 from GET /health without requiring authentication', async () => {
    // TRACED: EM-MON-002
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('Authorization', ''); // explicitly no auth

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    // Confirm no 401 or 403 returned
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('should return or generate x-correlation-id header', async () => {
    // TRACED: EM-MON-003
    const customId = '550e8400-e29b-41d4-a716-446655440000';

    // Test echoing a provided correlation ID
    const resWithId = await request(app.getHttpServer())
      .get('/health')
      .set('x-correlation-id', customId);

    expect(resWithId.headers['x-correlation-id']).toBe(customId);
    expect(resWithId.status).toBe(200);

    // Test auto-generation when no correlation ID is sent
    const resWithoutId = await request(app.getHttpServer()).get('/health');

    expect(resWithoutId.headers['x-correlation-id']).toBeDefined();
    expect(typeof resWithoutId.headers['x-correlation-id']).toBe('string');
    expect(resWithoutId.headers['x-correlation-id'].length).toBeGreaterThan(0);
  });

  it('should include X-Response-Time header on responses', async () => {
    // TRACED: EM-MON-004
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers['x-response-time']).toBeDefined();
    expect(typeof res.headers['x-response-time']).toBe('string');
    expect(res.headers['x-response-time']).toMatch(/^\d+(\.\d+)?ms$/);
  });

  it('should allow /health access without any Authorization header', async () => {
    // TRACED: EM-MON-005
    const res = await request(app.getHttpServer())
      .get('/health')
      .unset('Authorization');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
