import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app';

describe('Security', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-integration';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => { await app.close(); });

  // VERIFY: FD-SEC-INT-001 — protected endpoints reject unauthenticated requests
  it('GET /vehicles returns 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/vehicles')
      .expect(401);
  });

  it('GET /drivers returns 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/drivers')
      .expect(401);
  });

  // VERIFY: FD-SEC-INT-002 — invalid JWT returns 401
  it('GET /vehicles returns 401 with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  // VERIFY: FD-SEC-INT-003 — validation rejects malformed bodies
  it('POST /auth/register rejects empty body', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({})
      .expect(400);
  });
});
