import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:AE-TEST-002 — Dashboard integration tests with supertest
describe('Dashboard Integration', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Register and get token
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `dash-${Date.now()}@example.com`,
        password: 'dashpass123',
        name: 'Dash User',
        tenantName: 'Dash Tenant',
      });

    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /dashboards', () => {
    it('should create a dashboard', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Test Dashboard', description: 'A test dashboard' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Dashboard');
      expect(res.body.status).toBe('DRAFT');
    });

    it('should reject dashboard without title', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: 'No title' })
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .send({ title: 'Unauthorized' })
        .expect(401);
    });
  });

  describe('GET /dashboards', () => {
    it('should list dashboards with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
      expect(res.headers['cache-control']).toContain('private');
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should get a dashboard by id', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Findable Dashboard' });

      const res = await request(app.getHttpServer())
        .get(`/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.title).toBe('Findable Dashboard');
    });

    it('should return 404 for non-existent dashboard', async () => {
      await request(app.getHttpServer())
        .get('/dashboards/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /dashboards/:id/publish', () => {
    it('should publish a dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Publishable Dashboard' });

      const res = await request(app.getHttpServer())
        .patch(`/dashboards/${createRes.body.id}/publish`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.status).toBe('PUBLISHED');
    });
  });

  describe('PATCH /dashboards/:id/archive', () => {
    it('should archive a dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Archivable Dashboard' });

      const res = await request(app.getHttpServer())
        .patch(`/dashboards/${createRes.body.id}/archive`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.status).toBe('ARCHIVED');
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should delete a dashboard', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Deletable Dashboard' });

      await request(app.getHttpServer())
        .delete(`/dashboards/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });
});
