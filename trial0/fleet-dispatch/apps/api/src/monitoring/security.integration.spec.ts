// TRACED:FD-TEST-005
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Security Integration', () => {
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

  it('rejects requests without auth token to protected endpoints', async () => {
    const res = await request(app.getHttpServer()).get('/work-orders');
    expect(res.status).toBe(401);
  });

  it('rejects requests with invalid auth token', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });

  it('allows public endpoints without auth', async () => {
    const res = await request(app.getHttpServer()).get('/monitoring/health');
    expect(res.status).toBe(200);
  });

  it('allows public tracking endpoint without auth', async () => {
    const res = await request(app.getHttpServer()).get('/track/nonexistent-token');
    expect(res.status).toBe(404);
  });

  it('rejects malformed registration data', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: '', email: 'not-an-email' });
    expect([400, 422]).toContain(res.status);
  });
});
