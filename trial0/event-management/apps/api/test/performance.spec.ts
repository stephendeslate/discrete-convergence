// TRACED:EM-TEST-006 — Performance integration tests with supertest
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Performance Integration', () => {
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

  it('should include X-Response-Time on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/api/monitoring/health');
    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/\d+/);
  });

  it('should clamp pagination to MAX_PAGE_SIZE', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/events?limit=500');
    expect(res.status).toBe(200);
    expect(res.body.limit).toBeLessThanOrEqual(100);
  });

  it('should set Cache-Control on public event listings', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/events');
    expect(res.headers['cache-control']).toBeDefined();
  });

  it('should handle negative page gracefully', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/events?page=-1');
    expect(res.status).toBe(200);
    expect(res.body.page).toBeGreaterThanOrEqual(1);
  });
});
