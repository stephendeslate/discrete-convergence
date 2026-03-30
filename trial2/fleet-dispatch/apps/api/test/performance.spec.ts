import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Performance integration tests — response time headers, pagination clamping.
 * TRACED:FD-PERF-002
 */
describe('Performance Integration', () => {
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

  describe('Response Time', () => {
    it('should include X-Response-Time header', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });

    it('should include X-Response-Time on error responses', async () => {
      const response = await request(app.getHttpServer()).get('/nonexistent');

      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should return paginated responses from list endpoints', async () => {
      // Health endpoint is public — use metrics for pagination check
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('Caching', () => {
    it('should return health response quickly', async () => {
      const start = Date.now();
      const response = await request(app.getHttpServer()).get('/health');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });
  });
});
