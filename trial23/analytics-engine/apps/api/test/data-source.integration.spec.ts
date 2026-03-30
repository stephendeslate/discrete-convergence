import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, AuthTokens } from './helpers/test-utils';

process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/analytics_test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-min-32-chars!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-min-32!!';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';

describe('DataSource Integration', () => {
  let app: INestApplication;
  let tokens: AuthTokens;

  beforeAll(async () => {
    app = await createTestApp();
    tokens = await registerAndLogin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /data-sources', () => {
    it('should create a data source successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Test Source', type: 'REST' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test Source');
      expect(res.body.type).toBe('REST');
    });

    it('should return 400 for invalid type', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Bad Source', type: 'INVALID_TYPE' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ type: 'REST' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /data-sources', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });

    it('should return paginated data sources', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
    });
  });

  describe('GET /data-sources/:id', () => {
    it('should return a specific data source', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Findable Source', type: 'CSV' });

      const res = await request(app.getHttpServer())
        .get(`/data-sources/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createRes.body.id);
      expect(res.body.name).toBe('Findable Source');
    });

    it('should return 404 for nonexistent data source', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('PATCH /data-sources/:id', () => {
    it('should update a data source', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Original Name', type: 'POSTGRESQL' });

      const res = await request(app.getHttpServer())
        .patch(`/data-sources/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });
  });

  describe('DELETE /data-sources/:id', () => {
    it('should delete a data source', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'To Delete', type: 'WEBHOOK' });

      const res = await request(app.getHttpServer())
        .delete(`/data-sources/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');

      const getRes = await request(app.getHttpServer())
        .get(`/data-sources/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('POST /data-sources/:id/sync', () => {
    it('should trigger a sync for a data source', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Syncable Source', type: 'REST' });

      const res = await request(app.getHttpServer())
        .post(`/data-sources/${createRes.body.id}/sync`)
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('lastSyncAt');
    });

    it('should return 404 when syncing nonexistent data source', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources/00000000-0000-0000-0000-000000000000/sync')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('statusCode', 404);
    });
  });
});
