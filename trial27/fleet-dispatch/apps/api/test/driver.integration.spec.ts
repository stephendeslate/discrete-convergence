// TRACED: FD-API-003 — Driver integration tests
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Driver Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await getAuthToken(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /drivers', () => {
    it('should create a driver', async () => {
      const res = await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John Doe', email: 'john@example.com', licenseNumber: 'LIC-001' })
        .expect(201);

      expect(res.body.name).toBe('John Doe');
      expect(res.body.email).toBe('john@example.com');
    });

    it('should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/drivers')
        .send({ name: 'Jane', email: 'jane@example.com', licenseNumber: 'LIC-002' })
        .expect(401);
    });

    it('should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /drivers', () => {
    it('should list drivers', async () => {
      const res = await request(app.getHttpServer())
        .get('/drivers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('GET /drivers/:id', () => {
    it('should return 404 for non-existent driver', async () => {
      await request(app.getHttpServer())
        .get('/drivers/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /drivers/:id', () => {
    it('should update a driver', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Update Me', email: 'update@example.com', licenseNumber: 'UPD-001' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/drivers/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
    });
  });

  describe('DELETE /drivers/:id', () => {
    it('should delete a driver', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', email: 'delete@example.com', licenseNumber: 'DEL-001' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/drivers/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
