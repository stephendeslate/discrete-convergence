// TRACED:TEST-PERFORMANCE — Performance tests for response times
// VERIFY:FD-PERF-001 — Performance: health endpoint responds under 100ms
// VERIFY:FD-PERF-002 — Performance: paginated list responds under 200ms

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, generateTestToken, MockPrismaService } from './helpers/test-utils';

describe('Performance (e2e)', () => {
  let app: INestApplication;
  let prisma: MockPrismaService;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    token = generateTestToken();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should respond to health within 100ms', async () => {
    // Warm up request to avoid cold-start overhead
    await request(app.getHttpServer()).get('/health').expect(200);
    const start = Date.now();
    await request(app.getHttpServer()).get('/health').expect(200);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should respond to vehicle list within 200ms', async () => {
    prisma.vehicle.findMany.mockResolvedValue([]);
    prisma.vehicle.count.mockResolvedValue(0);

    const start = Date.now();
    await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });

  it('should return X-Response-Time header', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.headers['x-response-time']).toBeDefined();
  });
});
