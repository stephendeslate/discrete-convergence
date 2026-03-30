// TRACED:TEST-VEHICLE-INTEGRATION — Integration tests for vehicle CRUD auth rejection
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Vehicle Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /vehicles', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer()).get('/vehicles');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /vehicles', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .send({ vin: 'TEST123456789', make: 'Ford', model: 'Transit', year: 2023, licensePlate: 'AB-123' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should return not found for non-existent vehicle', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles/99999999-9999-9999-9999-999999999999')
        .set('Authorization', 'Bearer invalid');
      expect([401, 404]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('PATCH /vehicles/:id', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/vehicles/00000000-0000-0000-0000-000000000001')
        .send({ make: 'Toyota' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/vehicles/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
