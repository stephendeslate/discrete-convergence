// TRACED:FD-TEST-006
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Performance Integration', () => {
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

  it('health endpoint responds within 500ms', async () => {
    const start = Date.now();
    const res = await request(app.getHttpServer()).get('/monitoring/health');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(500);
  });

  it('includes X-Response-Time header', async () => {
    const res = await request(app.getHttpServer()).get('/monitoring/health');
    const responseTime = res.headers['x-response-time'];
    expect(responseTime).toBeDefined();
    expect(responseTime).toMatch(/^\d+ms$/);
  });

  it('concurrent requests are handled', async () => {
    const requests = Array.from({ length: 5 }, () =>
      request(app.getHttpServer()).get('/monitoring/health'),
    );

    const results = await Promise.all(requests);
    results.forEach((res) => {
      expect(res.status).toBe(200);
    });
  });
});
