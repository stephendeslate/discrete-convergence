// TRACED: FD-API-002 — Vehicle integration tests (requires running database)
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Vehicle Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await getAuthToken(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /vehicles', () => {
    it('should create a vehicle', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Truck 1', licensePlate: 'ABC-001', type: 'TRUCK' })
        .expect(201);

      expect(res.body.name).toBe('Truck 1');
      expect(res.body.licensePlate).toBe('ABC-001');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/vehicles')
        .send({ name: 'Truck', licensePlate: 'ABC-002' })
        .expect(401);
    });

    it('should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /vehicles', () => {
    it('should list vehicles', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return 404 for non-existent vehicle', async () => {
      await request(app.getHttpServer())
        .get('/vehicles/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /vehicles/:id', () => {
    it('should update a vehicle', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Van 1', licensePlate: 'UPD-001' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/vehicles/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Van' })
        .expect(200);

      expect(res.body.name).toBe('Updated Van');
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should delete a vehicle', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', licensePlate: 'DEL-001' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/vehicles/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
