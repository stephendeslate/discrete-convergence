import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TestApp } from './helpers/test-app';

// TRACED: AE-DS-001 — Create data source
// TRACED: AE-DS-002 — List data sources with pagination
// TRACED: AE-DS-003 — Get single data source
// TRACED: AE-DS-004 — Update data source
// TRACED: AE-DS-005 — Delete data source
// TRACED: AE-DS-006 — Test connection
// TRACED: AE-DS-007 — Sync data source

describe('DataSource Integration', () => {
  let app: INestApplication;
  let testApp: TestApp;
  let token: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `ds-${Date.now()}@example.com`, password: 'password123', name: 'DS User', tenantName: 'DSCo' });
    token = registerRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /data-sources should create a data source', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Source', type: 'REST_API', connectionConfig: '{"url":"https://api.test.com"}' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /data-sources should list data sources', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /data-sources/:id should return single data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Get-${Date.now()}`, type: 'CSV', connectionConfig: '{}' });

    const res = await request(app.getHttpServer())
      .get(`/data-sources/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('PATCH /data-sources/:id should update data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Upd-${Date.now()}`, type: 'WEBHOOK', connectionConfig: '{}' });

    const res = await request(app.getHttpServer())
      .patch(`/data-sources/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Source' });

    expect(res.status).toBe(200);
  });

  it('DELETE /data-sources/:id should delete data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Del-${Date.now()}`, type: 'CSV', connectionConfig: '{}' });

    const res = await request(app.getHttpServer())
      .delete(`/data-sources/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('POST /data-sources/:id/test-connection should test connection', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Test-${Date.now()}`, type: 'REST_API', connectionConfig: '{}' });

    const res = await request(app.getHttpServer())
      .post(`/data-sources/${createRes.body.id}/test-connection`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /data-sources/:id/sync should sync data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Sync-${Date.now()}`, type: 'REST_API', connectionConfig: '{}' });

    const res = await request(app.getHttpServer())
      .post(`/data-sources/${createRes.body.id}/sync`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
  });

  it('GET /data-sources should return 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/data-sources');
    expect(res.status).toBe(401);
  });

  it('GET /data-sources/:id should return not found for invalid id', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
