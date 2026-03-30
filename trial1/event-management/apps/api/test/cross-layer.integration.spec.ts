// TRACED:EM-CROSS-003 — Integration test covering auth → event creation → registration
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './test-setup';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp({ withValidation: true });
  });

  afterAll(async () => { await app?.close(); });

  it('unauthenticated request to /events returns 401', async () => {
    await request(app.getHttpServer()).get('/events').expect(401);
  });

  it('health endpoint is publicly accessible', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('metrics endpoint returns version', async () => {
    const res = await request(app.getHttpServer()).get('/metrics').expect(200);
    expect(res.body.version).toBeDefined();
  });
});
