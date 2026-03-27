// TRACED: FD-API-004 — Dispatch job integration tests
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Dispatch Job Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await getAuthToken(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /dispatch-jobs', () => {
    it('should create a dispatch job', async () => {
      const res = await request(app.getHttpServer())
        .post('/dispatch-jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({ origin: 'Warehouse A', destination: 'Customer B' })
        .expect(201);

      expect(res.body.origin).toBe('Warehouse A');
      expect(res.body.status).toBe('PENDING');
    });

    it('should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/dispatch-jobs')
        .send({ origin: 'A', destination: 'B' })
        .expect(401);
    });
  });

  describe('GET /dispatch-jobs', () => {
    it('should list dispatch jobs', async () => {
      const res = await request(app.getHttpServer())
        .get('/dispatch-jobs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('GET /dispatch-jobs/:id', () => {
    it('should return 404 for non-existent job', async () => {
      await request(app.getHttpServer())
        .get('/dispatch-jobs/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /dispatch-jobs/:id', () => {
    it('should update a dispatch job', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dispatch-jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({ origin: 'Warehouse X', destination: 'Customer Y' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/dispatch-jobs/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ origin: 'Updated Origin' })
        .expect(200);

      expect(res.body.origin).toBe('Updated Origin');
    });
  });

  describe('DELETE /dispatch-jobs/:id', () => {
    it('should delete a dispatch job', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dispatch-jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({ origin: 'Delete Origin', destination: 'Delete Dest' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/dispatch-jobs/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('POST /dispatch-jobs/:id/cancel', () => {
    it('should cancel a pending dispatch job', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dispatch-jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({ origin: 'Cancel Origin', destination: 'Cancel Dest' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`/dispatch-jobs/${createRes.body.id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('CANCELLED');
    });
  });

  describe('GET /audit-log', () => {
    it('should list audit logs', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit-log')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics with auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.uptime).toBeDefined();
      expect(res.body.memory).toBeDefined();
    });
  });
});
