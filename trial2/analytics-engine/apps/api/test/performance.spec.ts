import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:AE-TEST-006 — Performance integration tests with supertest
describe('Performance Integration', () => {
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

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `perf-${Date.now()}@example.com`,
        password: 'perfpass123',
        name: 'Perf User',
        tenantName: 'Perf Tenant',
      });

    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('X-Response-Time', () => {
    it('should include X-Response-Time on all responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should include X-Response-Time on authenticated routes', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should return paginated results', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards?page=1&pageSize=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('pageSize', 5);
      expect(res.body).toHaveProperty('totalPages');
    });

    it('should clamp oversized page size', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards?page=1&pageSize=500')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.pageSize).toBeLessThanOrEqual(100);
    });

    it('should use default page size when not specified', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.pageSize).toBe(20);
    });
  });

  describe('Cache-Control', () => {
    it('should include Cache-Control on list endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.headers['cache-control']).toContain('private');
    });
  });
});
