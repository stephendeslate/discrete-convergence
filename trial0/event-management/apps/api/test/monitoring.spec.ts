// TRACED:EM-TEST-004 — Monitoring integration tests with supertest
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should return health status', async () => {
    const res = await request(app.getHttpServer()).get('/api/monitoring/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
  });

  it('should return readiness status', async () => {
    const res = await request(app.getHttpServer()).get('/api/monitoring/ready');
    expect(res.status).toBe(200);
  });

  it('should return metrics', async () => {
    const res = await request(app.getHttpServer()).get('/api/monitoring/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requestCount');
    expect(res.body).toHaveProperty('errorCount');
  });

  it('should accept error reports', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/monitoring/errors')
      .send({ message: 'Test error' });
    expect(res.status).toBe(201);
  });

  it('should include X-Response-Time', async () => {
    const res = await request(app.getHttpServer()).get('/api/monitoring/health');
    expect(res.headers['x-response-time']).toBeDefined();
  });
});
