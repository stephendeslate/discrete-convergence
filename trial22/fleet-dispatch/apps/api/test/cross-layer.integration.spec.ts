import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, mockPrismaService } from './helpers/test-app';

describe('Cross-Layer Integration', () => {
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

  // VERIFY: FD-CROSS-001 — correlation ID header is present in response
  it('should include X-Correlation-ID in response headers', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.headers['x-correlation-id']).toBeDefined();
    expect(typeof res.headers['x-correlation-id']).toBe('string');
  });

  // VERIFY: FD-CROSS-002 — response time header is present
  it('should include X-Response-Time header on authenticated requests', async () => {
    mockPrismaService.vehicle.findMany.mockResolvedValue([]);
    mockPrismaService.vehicle.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/\d+ms/);
  });

  // VERIFY: FD-CROSS-003 — cache control headers on list endpoints
  it('should include Cache-Control header on list endpoints', async () => {
    mockPrismaService.vehicle.findMany.mockResolvedValue([]);
    mockPrismaService.vehicle.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['cache-control']).toBeDefined();
  });
});
