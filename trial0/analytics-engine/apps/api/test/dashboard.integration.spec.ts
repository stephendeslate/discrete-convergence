// TRACED:AE-TEST-002 — Dashboard integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Dashboard Integration (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `dashboard-test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        name: 'Dashboard Tester',
        role: 'USER',
        tenantId: 'test-tenant-id',
      });
    authToken = registerResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /dashboards', () => {
    it('should create a new dashboard', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Dashboard',
          description: 'A test dashboard',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Dashboard');
      expect(response.body.status).toBe('DRAFT');
    });

    it('should reject dashboard creation without auth', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .send({
          title: 'Unauthorized Dashboard',
        })
        .expect(401);
    });

    it('should reject dashboard with missing title', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'No title',
        })
        .expect(400);
    });
  });

  describe('GET /dashboards', () => {
    it('should list dashboards with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: '1', pageSize: '10' })
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should have Cache-Control header on list endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['cache-control']).toBeDefined();
    });
  });

  describe('PATCH /dashboards/:id/publish', () => {
    it('should publish a draft dashboard', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'To Publish' });

      const response = await request(app.getHttpServer())
        .patch(`/dashboards/${createResponse.body.id}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('PUBLISHED');
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should delete a dashboard', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'To Delete' });

      await request(app.getHttpServer())
        .delete(`/dashboards/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
