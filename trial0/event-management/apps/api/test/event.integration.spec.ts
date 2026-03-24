// TRACED:EM-TEST-002 — Event integration tests with supertest
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Event Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should reject events list without auth', async () => {
    const res = await request(app.getHttpServer()).get('/api/events');
    expect(res.status).toBe(401);
  });

  it('should allow public event listing', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/events');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
  });

  it('should support pagination on public events', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/events?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(5);
  });

  it('should clamp pagination over MAX_PAGE_SIZE', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/events?limit=999');
    expect(res.status).toBe(200);
    expect(res.body.limit).toBeLessThanOrEqual(100);
  });

  it('should set Cache-Control on public events', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/events');
    expect(res.headers['cache-control']).toContain('max-age');
  });

  it('should return 404 for non-existent event slug', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/events/no-org/no-event');
    expect(res.status).toBe(404);
  });
});
