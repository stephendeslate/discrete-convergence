import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { APP_VERSION, sanitizeLogContext, createCorrelationId, formatLogEntry } from '@event-management/shared';
import { createTestApp, createMockPrisma } from './helpers/test-utils';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  const mockPrisma = createMockPrisma();

  beforeAll(async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    app = await createTestApp(mockPrisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health with APP_VERSION from shared', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(APP_VERSION);
  });

  it('should set X-Correlation-ID on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-correlation-id']).toBeDefined();
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('should enforce auth on protected routes', async () => {
    const res = await request(app.getHttpServer()).get('/events');
    expect(res.status).toBe(401);
  });

  it('should allow public routes without auth', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should verify shared utilities work correctly', () => {
    const correlationId = createCorrelationId();
    expect(correlationId).toMatch(/^[0-9a-f-]{36}$/);

    const sanitized = sanitizeLogContext({ password: 'secret', name: 'test' });
    expect(sanitized).toEqual({ password: '[REDACTED]', name: 'test' });

    const entry = formatLogEntry({ level: 'info', message: 'test', timestamp: '2025-01-01T00:00:00Z' });
    expect(entry).toContain('"level":"info"');
    expect(entry).toContain('"message":"test"');
  });

  it('should return 401 for invalid token on protected routes', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
  });

  it('should return correlation ID in error responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('X-Correlation-ID', 'test-corr-123');
    expect(res.status).toBe(401);
    expect(res.headers['x-correlation-id']).toBe('test-corr-123');
  });

  it('should return 200 for DB readiness check', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('connected');
  });
});
