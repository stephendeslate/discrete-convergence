import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, mockPrismaService } from './helpers/test-app';

describe('Performance', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-integration';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const testApp = await createTestApp();
    app = testApp.app;
    const jwtService = app.get(JwtService);
    token = jwtService.sign({ sub: 'u1', email: 'test@test.com', role: 'ADMIN', tenantId: 't1' });
  });

  afterAll(async () => { await app.close(); });
  beforeEach(() => { jest.clearAllMocks(); });

  // VERIFY: FD-PERF-INT-001 — response time under threshold
  it('health endpoint responds within 200ms', async () => {
    const start = Date.now();
    await request(app.getHttpServer()).get('/health').expect(200);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  // VERIFY: FD-PERF-INT-002 — pagination limits max page size
  it('GET /vehicles respects page size limits', async () => {
    mockPrismaService.vehicle.findMany.mockResolvedValue([]);
    mockPrismaService.vehicle.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/vehicles?limit=1000')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.limit).toBeLessThanOrEqual(100);
  });
});
