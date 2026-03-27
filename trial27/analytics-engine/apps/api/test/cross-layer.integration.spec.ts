import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    token = await getAuthToken(app, (a) =>
      request(a.getHttpServer()),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health endpoints', () => {
    it('should return health status without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
    });

    it('should return health ready without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(res.body.status).toBeDefined();
    });
  });

  describe('Protected endpoints require auth', () => {
    it('should return 401 for dashboards without token - unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });

    it('should return 401 for data-sources without token - unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/data-sources')
        .expect(401);
    });

    it('should return 401 for metrics without token - unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/metrics')
        .expect(401);
    });

    it('should return 401 for audit-log without token - unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/audit-log')
        .expect(401);
    });
  });

  describe('Dashboard-Widget flow', () => {
    it('should create dashboard then add widget', async () => {
      const dashRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Flow-Test-${Date.now()}` })
        .expect(201);

      const widgetRes = await request(app.getHttpServer())
        .post(`/dashboards/${dashRes.body.id}/widgets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Revenue', type: 'LINE_CHART' })
        .expect(201);

      expect(widgetRes.body.name).toBe('Revenue');

      const listRes = await request(app.getHttpServer())
        .get(`/dashboards/${dashRes.body.id}/widgets`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(listRes.body).toHaveLength(1);
    });
  });

  describe('DataSource-Sync flow', () => {
    it('should create data source then view sync history', async () => {
      const dsRes = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Flow-DS-${Date.now()}`, type: 'CSV' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/data-sources/${dsRes.body.id}/sync`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const historyRes = await request(app.getHttpServer())
        .get(`/data-sources/${dsRes.body.id}/sync-history`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(historyRes.body.data).toHaveLength(1);
    });
  });

  describe('Audit log', () => {
    it('should list audit logs', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit-log')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('Widget CRUD flow', () => {
    it('should get widget data, update, and delete a widget', async () => {
      // Create dashboard
      const dashRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Widget-Flow-${Date.now()}` })
        .expect(201);

      // Create widget
      const widgetRes = await request(app.getHttpServer())
        .post(`/dashboards/${dashRes.body.id}/widgets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Sales Chart', type: 'BAR_CHART' })
        .expect(201);

      // GET widget data
      const dataRes = await request(app.getHttpServer())
        .get(`/widgets/${widgetRes.body.id}/data`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(dataRes.body.widgetId).toBe(widgetRes.body.id);

      // PUT update widget
      const updateRes = await request(app.getHttpServer())
        .put(`/widgets/${widgetRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Chart', type: 'LINE_CHART' })
        .expect(200);

      expect(updateRes.body.name).toBe('Updated Chart');

      // DELETE widget
      await request(app.getHttpServer())
        .delete(`/widgets/${widgetRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Correlation ID', () => {
    it('should return correlation ID header in response', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('x-correlation-id', 'test-correlation-123')
        .expect(200);

      expect(res.headers['x-correlation-id']).toBe('test-correlation-123');
    });
  });
});
