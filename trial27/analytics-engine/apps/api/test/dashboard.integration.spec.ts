import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    token = await getAuthToken(app, (a) =>
      request(a.getHttpServer()),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /dashboards', () => {
    it('should create a dashboard with valid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Dashboard', description: 'A test', layout: 'grid' })
        .expect(201);

      expect(res.body.name).toBe('Test Dashboard');
      expect(res.body.status).toBe('DRAFT');
    });

    it('should reject creating dashboard with duplicate name - conflict', async () => {
      const name = `Dashboard-${Date.now()}`;

      await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name })
        .expect(201);

      await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name })
        .expect(409);
    });

    it('should reject creating dashboard with empty name - invalid', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /dashboards', () => {
    it('should list dashboards with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards?page=1&pageSize=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });

    it('should return 401 without auth token - unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should return 404 for nonexistent dashboard - not found', async () => {
      await request(app.getHttpServer())
        .get('/dashboards/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /dashboards/:id/publish', () => {
    it('should publish a draft dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Publish-Test-${Date.now()}` })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/dashboards/${createRes.body.id}/publish`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('PUBLISHED');
    });
  });

  describe('PUT /dashboards/:id', () => {
    it('should update a dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Update-Test-${Date.now()}` })
        .expect(201);

      const res = await request(app.getHttpServer())
        .put(`/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', description: 'Updated desc' })
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
    });
  });

  describe('PATCH /dashboards/:id/archive', () => {
    it('should archive a published dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Archive-Test-${Date.now()}` })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/dashboards/${createRes.body.id}/publish`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/dashboards/${createRes.body.id}/archive`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('ARCHIVED');
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should delete a draft dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Delete-Test-${Date.now()}` })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
