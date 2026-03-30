import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:EM-TEST-005 — Security integration tests with supertest

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
    it('should reject unauthenticated requests to protected endpoints', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid JWT', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe('Validation', () => {
    it('should reject non-whitelisted properties', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'pass', hack: true });
      expect(res.status).toBe(400);
    });

    it('should validate email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-email', password: 'pass' });
      expect(res.status).toBe(400);
    });

    it('should enforce @MaxLength constraints', async () => {
      const longString = 'a'.repeat(300);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: longString, password: 'pass' });
      expect(res.status).toBe(400);
    });
  });

  describe('Error Sanitization', () => {
    it('should not expose stack traces', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.body).not.toHaveProperty('stack');
      expect(res.body).not.toHaveProperty('trace');
    });

    it('should include correlationId in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('X-Correlation-ID', 'sec-test-123');
      expect(res.body.correlationId).toBe('sec-test-123');
    });
  });

  describe('ADMIN role restriction', () => {
    it('should not allow registration with ADMIN role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          name: 'Hacker',
          organizationId: '00000000-0000-0000-0000-000000000000',
          role: 'ADMIN',
        });
      expect(res.status).toBe(400);
    });
  });
});
