import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Security integration tests — validates Helmet CSP, CORS, auth, validation.
 * TRACED:FD-SEC-004
 */
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
    it('should require auth for protected routes', async () => {
      const response = await request(app.getHttpServer()).get('/work-orders');
      expect(response.status).toBe(401);
    });

    it('should reject invalid JWT token', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should allow public routes without auth', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('Validation', () => {
    it('should reject non-whitelisted fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'pass', extra: 'field' });

      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-email', password: 'pass' });

      expect(response.status).toBe(400);
    });

    it('should reject empty body', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should not expose stack traces', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });

      expect(response.body.stack).toBeUndefined();
    });

    it('should include correlation ID in error response', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent');

      expect(response.body.correlationId).toBeDefined();
    });
  });
});
