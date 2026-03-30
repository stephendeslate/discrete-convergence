import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-setup';

describe('Performance', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => { await app?.close(); });

  it('GET /health includes X-Response-Time header', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });
});
