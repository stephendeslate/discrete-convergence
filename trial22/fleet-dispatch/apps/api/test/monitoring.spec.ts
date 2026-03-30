import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, mockPrismaService } from './helpers/test-app';

describe('Monitoring', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-integration';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => { await app.close(); });
  beforeEach(() => { jest.clearAllMocks(); });

  // VERIFY: FD-MON-INT-001 — health endpoint is publicly accessible
  it('GET /health should return ok without auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  // VERIFY: FD-MON-INT-002 — readiness endpoint reports database status
  it('GET /health/ready should report database connected', async () => {
    mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });
});
