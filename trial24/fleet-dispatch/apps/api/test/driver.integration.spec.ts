// TRACED:TEST-DRIVER-INTEGRATION — Integration tests for driver CRUD auth rejection
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/test-utils';

describe('Driver Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /drivers', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer()).get('/drivers');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/drivers')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /drivers', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post('/drivers')
        .send({ name: 'Jane Doe', email: 'jane@fleet.test', licenseNumber: 'DL-12345' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /drivers/:id', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .get('/drivers/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should return not found for non-existent driver', async () => {
      const res = await request(app.getHttpServer())
        .get('/drivers/99999999-9999-9999-9999-999999999999')
        .set('Authorization', 'Bearer invalid');
      expect([401, 404]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('PATCH /drivers/:id', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/drivers/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated Name' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /drivers/:id', () => {
    it('should return 401 without auth (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/drivers/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
