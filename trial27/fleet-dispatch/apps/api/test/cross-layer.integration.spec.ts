// TRACED: FD-INF-004 — Cross-layer integration tests (requires running database)
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await getAuthToken(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('Health endpoints', () => {
    it('GET /health should return ok without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body.version).toBeDefined();
    });

    it('GET /health/ready should return database status', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(res.body.status).toBeDefined();
      expect(res.body.database).toBeDefined();
    });
  });

  describe('Authentication flows', () => {
    it('should reject unauthenticated requests to protected endpoints', async () => {
      await request(app.getHttpServer()).get('/vehicles').expect(401);
      await request(app.getHttpServer()).get('/drivers').expect(401);
      await request(app.getHttpServer()).get('/dispatch-jobs').expect(401);
      await request(app.getHttpServer()).get('/metrics').expect(401);
    });

    it('should reject requests with invalid JWT', async () => {
      await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should accept authenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Correlation ID', () => {
    it('should echo back correlation ID in response', async () => {
      const correlationId = 'test-correlation-id-123';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId)
        .expect(200);

      expect(res.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should generate correlation ID if not provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-correlation-id']).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should reject requests with invalid body', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad' })
        .expect(400);
    });

    it('should reject requests with extra fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'test', extraField: 'bad' })
        .expect(400);
    });
  });

  describe('Full dispatch flow', () => {
    it('should support create vehicle → create driver → create job → assign → complete', async () => {
      // Create vehicle
      const vehicleRes = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Flow Van', licensePlate: 'FLOW-001', type: 'VAN' })
        .expect(201);

      // Create driver
      const driverRes = await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Flow Driver', email: 'flow@example.com', licenseNumber: 'FL-001' })
        .expect(201);

      // Create job
      const jobRes = await request(app.getHttpServer())
        .post('/dispatch-jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({ origin: 'Warehouse A', destination: 'Customer B' })
        .expect(201);

      expect(jobRes.body.status).toBe('PENDING');

      // Assign
      const assignRes = await request(app.getHttpServer())
        .post(`/dispatch-jobs/${jobRes.body.id}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ vehicleId: vehicleRes.body.id, driverId: driverRes.body.id })
        .expect(200);

      expect(assignRes.body.status).toBe('IN_PROGRESS');

      // Complete
      const completeRes = await request(app.getHttpServer())
        .post(`/dispatch-jobs/${jobRes.body.id}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(completeRes.body.status).toBe('COMPLETED');
    });
  });

  describe('Maintenance endpoints', () => {
    it('should create and list maintenance logs for a vehicle', async () => {
      // Create vehicle first
      const vehicleRes = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Maint Van', licensePlate: 'MNT-001', type: 'VAN' })
        .expect(201);

      // Create maintenance log
      const maintRes = await request(app.getHttpServer())
        .post(`/vehicles/${vehicleRes.body.id}/maintenance`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'OIL_CHANGE', description: 'Routine oil change', cost: 75.00 })
        .expect(201);

      expect(maintRes.body.type).toBe('OIL_CHANGE');

      // List maintenance logs
      const listRes = await request(app.getHttpServer())
        .get(`/vehicles/${vehicleRes.body.id}/maintenance`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(listRes.body.data).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should return structured error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles/non-existent')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBeDefined();
    });

    it('should handle 404 for unknown routes', async () => {
      await request(app.getHttpServer())
        .get('/unknown-route')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
