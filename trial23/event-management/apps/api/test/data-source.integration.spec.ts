process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://testuser:testpass@localhost:5433/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin } from './helpers/test-utils';

describe('DataSource Integration', () => {
  let app: INestApplication;
  let tokens: { access_token: string; refresh_token: string };

  beforeAll(async () => {
    app = await createTestApp();
    tokens = await registerAndLogin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  function authGet(path: string) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', 'Bearer ' + tokens.access_token);
  }

  function authPost(path: string) {
    return request(app.getHttpServer())
      .post(path)
      .set('Authorization', 'Bearer ' + tokens.access_token);
  }

  function authPatch(path: string) {
    return request(app.getHttpServer())
      .patch(path)
      .set('Authorization', 'Bearer ' + tokens.access_token);
  }

  function authDelete(path: string) {
    return request(app.getHttpServer())
      .delete(path)
      .set('Authorization', 'Bearer ' + tokens.access_token);
  }

  function createDataSourcePayload(overrides?: Record<string, unknown>) {
    return {
      name: 'Test DataSource',
      type: 'POSTGRESQL',
      config: { host: 'localhost', port: 5432 },
      ...overrides,
    };
  }

  describe('GET /data-sources', () => {
    it('should return paginated list', async () => {
      const res = await authGet('/data-sources').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /data-sources', () => {
    it('should create data source', async () => {
      const res = await authPost('/data-sources')
        .send(createDataSourcePayload())
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test DataSource');
      expect(res.body.type).toBe('POSTGRESQL');
      expect(res.body.status).toBe('ACTIVE');
    });
  });

  describe('GET /data-sources/:id', () => {
    it('should return single data source', async () => {
      const createRes = await authPost('/data-sources')
        .send(createDataSourcePayload({ name: 'Single DS' }))
        .expect(201);

      const dsId = createRes.body.id;

      const res = await authGet(`/data-sources/${dsId}`).expect(200);

      expect(res.body.id).toBe(dsId);
      expect(res.body.name).toBe('Single DS');
    });

    it('should return 404 for non-existent data source', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await authGet(`/data-sources/${fakeId}`).expect(404);

      expect(res.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /data-sources/:id', () => {
    it('should update data source', async () => {
      const createRes = await authPost('/data-sources')
        .send(createDataSourcePayload())
        .expect(201);

      const dsId = createRes.body.id;

      const res = await authPatch(`/data-sources/${dsId}`)
        .send({ name: 'Updated DataSource' })
        .expect(200);

      expect(res.body.name).toBe('Updated DataSource');
    });
  });

  describe('DELETE /data-sources/:id', () => {
    it('should remove data source', async () => {
      const createRes = await authPost('/data-sources')
        .send(createDataSourcePayload({ name: 'To Delete DS' }))
        .expect(201);

      const dsId = createRes.body.id;

      await authDelete(`/data-sources/${dsId}`).expect(200);

      await authGet(`/data-sources/${dsId}`).expect(404);
    });
  });

  describe('POST /data-sources/:id/sync', () => {
    it('should trigger sync', async () => {
      const createRes = await authPost('/data-sources')
        .send(createDataSourcePayload({ name: 'Sync DS' }))
        .expect(201);

      const dsId = createRes.body.id;

      const res = await authPost(`/data-sources/${dsId}/sync`).expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('dataSourceId');
      expect(res.body.dataSourceId).toBe(dsId);
    });
  });

  describe('GET /data-sources/:id/sync-history', () => {
    it('should return sync history', async () => {
      const createRes = await authPost('/data-sources')
        .send(createDataSourcePayload({ name: 'History DS' }))
        .expect(201);

      const dsId = createRes.body.id;

      // Trigger a sync first
      await authPost(`/data-sources/${dsId}/sync`).expect(201);

      const res = await authGet(`/data-sources/${dsId}/sync-history`).expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
  });
});
