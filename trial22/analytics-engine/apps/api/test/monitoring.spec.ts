import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getMockPrisma, resetMocks } from './helpers/test-app';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks();
  });

  it('GET /health should return status ok without auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /health/ready should check database connectivity', async () => {
    const prisma = getMockPrisma();
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('timestamp');
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('GET /metrics should return metrics without auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/metrics')
      .expect(200);

    expect(res.body).toHaveProperty('requests');
    expect(res.body).toHaveProperty('errors');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.requests).toBe('number');
  });

  it('should include X-Response-Time header', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.headers).toHaveProperty('x-response-time');
    expect(res.headers['x-response-time']).toMatch(/\d+ms/);
  });
});
