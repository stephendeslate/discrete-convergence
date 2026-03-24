// TRACED:AE-TEST-003 — Cross-layer integration test verifying full pipeline
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@analytics-engine/shared';

describe('Cross-Layer Integration (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  // Auth → CRUD → Error handling → Correlation IDs → Response time → Health → DB check
  describe('Full pipeline verification', () => {
    it('should include X-Response-Time header on all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });

    it('should return health with version from shared constant', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return readiness with DB check', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
    });

    it('should include correlationId in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards/nonexistent-id')
        .expect(401);

      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).not.toHaveProperty('stack');
    });

    it('should reject unauthenticated requests to protected endpoints', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });

    it('should allow access to public endpoints without auth', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);
    });

    it('should return metrics with request counts', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should handle auth flow end-to-end', async () => {
      const email = `crosslayer-${Date.now()}@example.com`;

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'SecurePass123!',
          name: 'Cross Layer User',
          role: 'USER',
          tenantId: 'test-tenant-id',
        })
        .expect(201);

      const token = registerResponse.body.accessToken;
      expect(token).toBeDefined();

      const dashboardResponse = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Cross Layer Test Dashboard' })
        .expect(201);

      expect(dashboardResponse.body.title).toBe('Cross Layer Test Dashboard');
      expect(dashboardResponse.headers['x-response-time']).toBeDefined();
    });

    it('should accept frontend error reports', async () => {
      await request(app.getHttpServer())
        .post('/errors')
        .send({
          message: 'Component render error',
          stack: 'Error: Component render error\n  at ...',
          url: '/dashboards',
        })
        .expect(201);
    });
  });
});
