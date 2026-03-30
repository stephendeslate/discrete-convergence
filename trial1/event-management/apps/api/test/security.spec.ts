import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-setup';

describe('Security', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp({ withValidation: true });
  });

  afterAll(async () => { await app?.close(); });

  it('rejects unauthenticated requests to protected endpoints', async () => {
    await request(app.getHttpServer()).get('/events').expect(401);
  });

  it('rejects requests with extra fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'pass1234', role: 'ADMIN', extraField: 'bad' })
      .expect(400);
  });
});
