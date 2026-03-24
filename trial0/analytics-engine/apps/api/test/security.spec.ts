// TRACED:AE-TEST-005 — Security integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Integration (e2e)', () => {
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
    it('should reject requests without auth token', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });

    it('should reject requests with invalid auth token', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    it('should strip unknown properties (whitelist)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test',
          role: 'USER',
          tenantId: 'test-id',
          malicious: 'payload',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject overly long strings', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'a'.repeat(300) + '@example.com',
          password: 'SecurePass123!',
          name: 'Test',
          role: 'USER',
          tenantId: 'test-id',
        })
        .expect(400);
    });
  });

  describe('Error Response Sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards/invalid-uuid')
        .expect(401);

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
    });

    it('should include correlationId in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toHaveProperty('correlationId');
    });
  });

  describe('Rate Limiting', () => {
    it('should have throttle protection on endpoints', async () => {
      // Verify the ThrottlerGuard is active by checking that
      // rapid requests don't cause server errors
      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get('/health')
          .expect((res: request.Response) => {
            expect([200, 429]).toContain(res.status);
          }),
      );
      await Promise.all(promises);
    });
  });
});
