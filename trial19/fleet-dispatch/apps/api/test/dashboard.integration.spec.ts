import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Dashboard & DataSource Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /dashboards — should return 401 without auth', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('GET /data-sources — should return 401 without auth', async () => {
    const res = await request(app.getHttpServer()).get('/data-sources');
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('GET /dashboards — should return 401 with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('GET /data-sources — should return 401 with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });
});
