// TRACED:FD-TEST-003
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('health endpoint returns structured response', async () => {
    const res = await request(app.getHttpServer()).get('/monitoring/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('memory');
    expect(res.body).toHaveProperty('db');
  });

  it('correlation ID is propagated in response headers', async () => {
    const res = await request(app.getHttpServer())
      .get('/monitoring/health')
      .set('X-Correlation-ID', 'test-corr-123');

    expect(res.headers['x-correlation-id']).toBe('test-corr-123');
  });

  it('response time header is set', async () => {
    const res = await request(app.getHttpServer()).get('/monitoring/health');
    expect(res.headers['x-response-time']).toBeDefined();
  });
});
