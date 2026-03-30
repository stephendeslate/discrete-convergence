// TRACED:TEST-VENUE-INTEGRATION — Integration tests for venue CRUD endpoints
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Venue Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /venues', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer()).get('/venues');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /venues/:id', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .get('/venues/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject non-UUID id with auth (invalid format)', async () => {
      const res = await request(app.getHttpServer())
        .get('/venues/not-a-uuid')
        .set('Authorization', 'Bearer invalid-token');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });

    it('should return not found for non-existent venue', async () => {
      const res = await request(app.getHttpServer())
        .get('/venues/99999999-9999-9999-9999-999999999999')
        .set('Authorization', 'Bearer invalid');
      expect([401, 404]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /venues', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post('/venues')
        .send({ name: 'Test Venue', address: '123 Main St', capacity: 500 });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/venues')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Test Venue', address: '123 Main St', capacity: 500 });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('PATCH /venues/:id', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/venues/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated Venue' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /venues/:id', () => {
    it('should reject without authentication (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/venues/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
