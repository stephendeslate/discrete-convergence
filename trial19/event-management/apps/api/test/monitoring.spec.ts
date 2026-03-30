import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { APP_VERSION } from '@event-management/shared';
import { createTestApp, createMockPrisma } from './helpers/test-utils';

describe('Monitoring Integration', () => {
  let app: INestApplication;
  const mockPrisma = createMockPrisma();

  beforeAll(async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    app = await createTestApp(mockPrisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status with ok', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should include version from shared APP_VERSION', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.body.version).toBe(APP_VERSION);
      expect(res.body).toHaveProperty('uptime');
    });

    it('should be publicly accessible without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /health/ready', () => {
    it('should return database connected status', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
      const res = await request(app.getHttpServer()).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.body.database).toBe('connected');
    });

    it('should return disconnected when database fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB down'));
      const res = await request(app.getHttpServer()).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.body.database).toBe('disconnected');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics endpoint data', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
});
