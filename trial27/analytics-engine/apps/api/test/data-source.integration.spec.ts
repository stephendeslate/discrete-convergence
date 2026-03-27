import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('DataSource Integration', () => {
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

  describe('POST /data-sources', () => {
    it('should create a data source', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `DS-${Date.now()}`, type: 'REST_API' })
        .expect(201);

      expect(res.body.name).toContain('DS-');
      expect(res.body.type).toBe('REST_API');
    });

    it('should reject creating data source with duplicate name - conflict', async () => {
      const name = `DS-dup-${Date.now()}`;

      await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name, type: 'REST_API' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name, type: 'REST_API' })
        .expect(409);
    });
  });

  describe('GET /data-sources', () => {
    it('should list data sources with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources?page=1&pageSize=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('GET /data-sources/:id', () => {
    it('should return 404 for nonexistent data source - not found', async () => {
      await request(app.getHttpServer())
        .get('/data-sources/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /data-sources/:id/test-connection', () => {
    it('should test connection for active data source', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `DS-test-${Date.now()}`,
          type: 'REST_API',
          config: { url: 'http://example.com' },
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/data-sources/${createRes.body.id}/test-connection`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /data-sources/:id/sync', () => {
    it('should sync an active data source', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `DS-sync-${Date.now()}`, type: 'REST_API' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/data-sources/${createRes.body.id}/sync`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body.status).toBe('COMPLETED');
    });
  });

  describe('PUT /data-sources/:id', () => {
    it('should update a data source', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `DS-upd-${Date.now()}`, type: 'CSV' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .put(`/data-sources/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `DS-upd-renamed-${Date.now()}` })
        .expect(200);

      expect(res.body.name).toContain('DS-upd-renamed');
    });
  });

  describe('DELETE /data-sources/:id', () => {
    it('should delete a data source', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `DS-del-${Date.now()}`, type: 'CSV' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/data-sources/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
