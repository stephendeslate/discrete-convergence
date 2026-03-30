import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Performance Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response headers', () => {
    it('should include X-Response-Time header on health', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });

    it('should include X-Correlation-ID header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('should preserve client-provided correlation ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', 'client-corr-123');
      expect(res.headers['x-correlation-id']).toBe('client-corr-123');
    });
  });

  describe('Health endpoint performance', () => {
    it('should respond within 500ms', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer()).get('/health');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });

    it('should handle multiple rapid requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app.getHttpServer()).get('/health'),
      );
      const results = await Promise.all(promises);

      for (const res of results) {
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
      }
    });
  });

  describe('Pagination', () => {
    it('should return 401 on protected paginated endpoint without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards?page=1&limit=10');
      expect(res.status).toBe(401);
    });
  });
});
