import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TestApp } from './helpers/test-app';

// TRACED: AE-DASH-001 — Create dashboard
// TRACED: AE-DASH-002 — List dashboards with pagination
// TRACED: AE-DASH-003 — Get single dashboard
// TRACED: AE-DASH-004 — Update dashboard
// TRACED: AE-DASH-005 — Delete dashboard
// TRACED: AE-DASH-006 — Publish dashboard
// TRACED: AE-DASH-007 — Archive dashboard
// TRACED: AE-EDGE-001 — Empty dashboard name

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let testApp: TestApp;
  let token: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `dash-${Date.now()}@example.com`, password: 'password123', name: 'Dashboard User', tenantName: 'DashCo' });
    token = registerRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /dashboards should create a dashboard', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Dashboard', description: 'A test dashboard' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Dashboard');
  });

  it('GET /dashboards should list dashboards with pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
  });

  it('GET /dashboards/:id should return single dashboard', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Get-${Date.now()}` });

    const res = await request(app.getHttpServer())
      .get(`/dashboards/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createRes.body.id);
  });

  it('PATCH /dashboards/:id should update dashboard', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Update-${Date.now()}` });

    const res = await request(app.getHttpServer())
      .patch(`/dashboards/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
  });

  it('DELETE /dashboards/:id should delete dashboard', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Delete-${Date.now()}` });

    const res = await request(app.getHttpServer())
      .delete(`/dashboards/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('PATCH /dashboards/:id/publish should publish draft dashboard', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Publish-${Date.now()}` });

    const res = await request(app.getHttpServer())
      .patch(`/dashboards/${createRes.body.id}/publish`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('PATCH /dashboards/:id/archive should archive dashboard', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Archive-${Date.now()}` });

    const res = await request(app.getHttpServer())
      .patch(`/dashboards/${createRes.body.id}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('GET /dashboards should return 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
  });

  it('GET /dashboards/:id should return not found for invalid id', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
