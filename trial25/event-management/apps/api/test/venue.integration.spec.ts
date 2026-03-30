import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestApp } from './helpers/test-utils';

describe('Venue Integration', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /venues', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-VEN-V01 — venue list requires authentication
      const response = await request(app.getHttpServer()).get('/venues');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /venues', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-VEN-V02 — venue creation requires authentication
      const response = await request(app.getHttpServer())
        .post('/venues')
        .send({ name: 'Hall', address: '123 St', city: 'NY', capacity: 500 });
      expect(response.status).toBe(401);
    });
  });
});
