// TRACED:EM-TEST-007 — security integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env['JWT_SECRET'] = 'test-jwt-secret-for-integration';
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env['CORS_ORIGIN'] = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('Authentication enforcement', () => {
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

  describe('Input validation', () => {
    it('should reject unexpected fields (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'pass', hackerField: 'malicious' });
      expect(res.status).toBe(400);
    });

    it('should reject oversized inputs', async () => {
      const longString = 'a'.repeat(300);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: longString, password: 'pass' });
      expect(res.status).toBe(400);
    });
  });

  describe('Public endpoints', () => {
    it('should allow health without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
    });
  });
});
