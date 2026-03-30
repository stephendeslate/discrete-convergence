import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestApp } from './helpers/test-utils';

describe('Ticket Integration', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /tickets', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-TKT-V01 — ticket list requires authentication
      const response = await request(app.getHttpServer()).get('/tickets');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /tickets/:id/cancel', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-TKT-V02 — ticket cancel requires authentication
      const response = await request(app.getHttpServer()).patch('/tickets/some-id/cancel');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /tickets/:id/refund', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-TKT-V03 — ticket refund requires authentication
      const response = await request(app.getHttpServer()).patch('/tickets/some-id/refund');
      expect(response.status).toBe(401);
    });
  });
});
