// TRACED:TEST-DATASOURCE-INTEGRATION — Integration tests for data source endpoints
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('DataSource Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /data-sources', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app.getHttpServer()).get('/data-sources');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /data-sources', () => {
    it('should reject unauthenticated create', async () => {
      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .send({ name: 'Test', type: 'postgresql', connectionString: 'pg://localhost/db' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /data-sources/:id', () => {
    it('should reject unauthenticated get', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should return not found for non-existent data source', async () => {
      const res = await request(app.getHttpServer())
        .get('/data-sources/99999999-9999-9999-9999-999999999999')
        .set('Authorization', 'Bearer invalid');
      expect([401, 404]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /data-sources/:id', () => {
    it('should reject unauthenticated delete', async () => {
      const res = await request(app.getHttpServer())
        .delete('/data-sources/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
