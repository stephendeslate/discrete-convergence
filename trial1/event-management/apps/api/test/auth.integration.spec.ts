import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-setup';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp({ withValidation: true });
  });

  afterAll(async () => { await app?.close(); });

  it('POST /auth/register rejects invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test', email: 'invalid', password: 'pass1234', role: 'ADMIN' })
      .expect(400);
  });

  it('POST /auth/login rejects missing fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);
  });

  it('GET /health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
