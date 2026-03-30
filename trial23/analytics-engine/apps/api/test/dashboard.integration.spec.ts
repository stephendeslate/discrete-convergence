import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, AuthTokens } from './helpers/test-utils';

process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/analytics_test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-min-32-chars!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-min-32!!';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let tokens: AuthTokens;

  beforeAll(async () => {
    app = await createTestApp();
    tokens = await registerAndLogin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /dashboards', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('statusCode', 401);
    });

    it('should return paginated dashboards with auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
    });
  });

  describe('POST /dashboards', () => {
    it('should create a dashboard successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Test Dashboard' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test Dashboard');
      expect(res.body).toHaveProperty('tenantId');
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for forbidNonWhitelisted extra fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Valid Name', extraField: 'not allowed' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should create dashboard with optional description', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Described Dashboard', description: 'A test description' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Described Dashboard');
      expect(res.body.description).toBe('A test description');
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should return a specific dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Specific Dashboard' });

      const res = await request(app.getHttpServer())
        .get(`/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createRes.body.id);
      expect(res.body.name).toBe('Specific Dashboard');
    });

    it('should return 404 for nonexistent dashboard', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('PATCH /dashboards/:id', () => {
    it('should update a dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'Before Update' });

      const res = await request(app.getHttpServer())
        .patch(`/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'After Update' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('After Update');
    });

    it('should return 404 when updating nonexistent dashboard', async () => {
      const res = await request(app.getHttpServer())
        .patch('/dashboards/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'No Such Dashboard' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should delete a dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${tokens.access_token}`)
        .send({ name: 'To Be Deleted' });

      const res = await request(app.getHttpServer())
        .delete(`/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');

      const getRes = await request(app.getHttpServer())
        .get(`/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokens.access_token}`);

      expect(getRes.status).toBe(404);
    });
  });
});
