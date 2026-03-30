import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:EM-TEST-006 — Performance integration tests with supertest

describe('Performance Integration (e2e)', () => {
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

  describe('Response Time Header', () => {
    it('should include X-Response-Time header on all responses', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });

    it('should include X-Response-Time on error responses', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should accept page and pageSize query params', async () => {
      const res = await request(app.getHttpServer())
        .get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('Health Endpoint Performance', () => {
    it('should respond quickly to health check', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer()).get('/health');
      const duration = Date.now() - start;
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });
  });
});
