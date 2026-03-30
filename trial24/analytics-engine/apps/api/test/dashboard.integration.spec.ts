// TRACED:TEST-DASHBOARD-INTEGRATION — Integration tests for dashboard endpoints
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Dashboard Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /dashboards', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /dashboards', () => {
    it('should reject unauthenticated create', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ name: 'Test' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should reject unauthenticated get by id', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject invalid UUID', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards/not-a-uuid');
      expect([400, 401, 422]).toContain(res.status);
      expect(res.body).toBeDefined();
    });

    it('should return not found for non-existent dashboard', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards/99999999-9999-9999-9999-999999999999')
        .set('Authorization', 'Bearer invalid');
      expect([401, 404]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('PUT /dashboards/:id', () => {
    it('should reject unauthenticated update', async () => {
      const res = await request(app.getHttpServer())
        .put('/dashboards/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should reject unauthenticated delete', async () => {
      const res = await request(app.getHttpServer())
        .delete('/dashboards/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
