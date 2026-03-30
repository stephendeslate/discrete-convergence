import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-setup';

describe('Monitoring', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => { await app?.close(); });

  it('GET /health returns ok', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });

  it('GET /metrics returns version and uptime', async () => {
    const res = await request(app.getHttpServer()).get('/metrics').expect(200);
    expect(res.body.version).toBeDefined();
    expect(res.body.uptime).toBeDefined();
  });
});
