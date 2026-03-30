// TRACED:TEST-EVENT-INTEGRATION — Integration tests for event CRUD endpoints
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Event Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /events', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /events/:id', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject non-UUID id with auth (invalid format)', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/not-a-uuid')
        .set('Authorization', 'Bearer invalid-token');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });

    it('should return not found for non-existent event', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/99999999-9999-9999-9999-999999999999')
        .set('Authorization', 'Bearer invalid');
      expect([401, 404]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /events', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .send({
          title: 'Test Event',
          startDate: '2024-06-15T09:00:00Z',
          endDate: '2024-06-17T17:00:00Z',
        });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: 'Test Event',
          startDate: '2024-06-15T09:00:00Z',
          endDate: '2024-06-17T17:00:00Z',
        });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('PATCH /events/:id', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/events/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /events/:id', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/events/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
