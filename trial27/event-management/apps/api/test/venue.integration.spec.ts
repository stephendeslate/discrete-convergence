// TRACED: EM-API-004 — Venue integration tests
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Venue Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await getAuthToken(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /venues', () => {
    it('should create a venue', async () => {
      const res = await request(app.getHttpServer())
        .post('/venues')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Main Hall', address: '123 Main St', capacity: 500 })
        .expect(201);

      expect(res.body.name).toBe('Main Hall');
      expect(res.body.address).toBe('123 Main St');
      expect(res.body.capacity).toBe(500);
    });

    it('should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/venues')
        .send({ name: 'Hall', address: '456 St', capacity: 100 })
        .expect(401);
    });

    it('should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/venues')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /venues', () => {
    it('should list venues', async () => {
      const res = await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('GET /venues/:id', () => {
    it('should return 404 for non-existent venue', async () => {
      await request(app.getHttpServer())
        .get('/venues/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /venues/:id', () => {
    it('should update a venue', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/venues')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Name', address: '789 Ave', capacity: 200 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/venues/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Venue' })
        .expect(200);

      expect(res.body.name).toBe('Updated Venue');
    });
  });

  describe('DELETE /venues/:id', () => {
    it('should delete a venue', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/venues')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', address: '101 Rd', capacity: 50 })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/venues/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
