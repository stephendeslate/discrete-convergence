// TRACED:AE-TEST-006 — Performance integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Performance Integration (e2e)', () => {
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
        email: `perf-test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        name: 'Perf Tester',
        role: 'USER',
        tenantId: 'test-tenant-id',
      });
    authToken = registerResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response Time Headers', () => {
    it('should include X-Response-Time on all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/ms$/);
    });

    it('should include X-Response-Time on authenticated endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);

      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should clamp oversized page size to MAX_PAGE_SIZE', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: '1', pageSize: '500' })
        .expect(200);

      expect(response.body.pageSize).toBeLessThanOrEqual(100);
    });

    it('should use default page size when not specified', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pageSize).toBe(20);
    });
  });

  describe('Cache-Control Headers', () => {
    it('should include Cache-Control on list endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['cache-control']).toBeDefined();
    });
  });
});
