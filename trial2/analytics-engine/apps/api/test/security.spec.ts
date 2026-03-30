import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:AE-TEST-005 — Security integration tests with supertest
describe('Security Integration', () => {
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

  describe('Authentication', () => {
    it('should reject unauthenticated requests to protected routes', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });

    it('should reject invalid JWT tokens', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Validation', () => {
    it('should reject requests with extra fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `sec-${Date.now()}@example.com`,
          password: 'secpass123',
          name: 'Sec User',
          tenantName: 'Sec Tenant',
          malicious: 'extra-field',
        })
        .expect(400);
    });

    it('should reject overlong strings', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'a'.repeat(300) + '@example.com',
          password: 'pass',
        })
        .expect(400);
    });
  });

  describe('Headers', () => {
    it('should include security headers from Helmet', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should include X-Response-Time header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Error Response Format', () => {
    it('should not expose stack traces', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);

      expect(res.body).not.toHaveProperty('stack');
      expect(res.body).toHaveProperty('statusCode');
      expect(res.body).toHaveProperty('message');
    });

    it('should include correlationId in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('X-Correlation-ID', 'error-test-id')
        .expect(401);

      expect(res.body).toHaveProperty('correlationId');
    });
  });
});
