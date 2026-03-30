import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, createMockPrisma } from './helpers/test-utils';

describe('Performance Integration', () => {
  let app: INestApplication;
  const mockPrisma = createMockPrisma();

  beforeAll(async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockPrisma.event.findMany.mockResolvedValue([]);
    mockPrisma.event.count.mockResolvedValue(0);
    app = await createTestApp(mockPrisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('X-Response-Time header', () => {
    it('should include X-Response-Time on /health', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on /health/ready', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should have response time under 500ms for health', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      const time = parseInt(res.headers['x-response-time'], 10);
      expect(time).toBeLessThan(500);
      expect(res.status).toBe(200);
    });
  });

  describe('X-Correlation-ID header', () => {
    it('should generate correlation ID when not provided', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('should preserve client-provided correlation ID', async () => {
      const customId = 'my-custom-correlation-id';
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', customId);
      expect(res.headers['x-correlation-id']).toBe(customId);
    });
  });

  describe('Health endpoint load', () => {
    it('should handle 10 rapid sequential requests without errors', async () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(await request(app.getHttpServer()).get('/health'));
      }
      const allOk = results.every((r) => r.status === 200);
      expect(allOk).toBe(true);
      expect(results.length).toBe(10);
    });
  });
});
