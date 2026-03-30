import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestApp } from './helpers/test-utils';

describe('Event Integration', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /events', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-EVT-V01 — events list requires authentication
      const response = await request(app.getHttpServer()).get('/events');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /events', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-EVT-V02 — event creation requires authentication
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({ title: 'Test', slug: 'test', startDate: '2025-01-01', endDate: '2025-01-02', capacity: 100 });
      expect(response.status).toBe(401);
    });
  });

  describe('GET /events/:id', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-EVT-V03 — event detail requires authentication
      const response = await request(app.getHttpServer()).get('/events/some-id');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /events/:id/publish', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-EVT-V04 — publish requires authentication
      const response = await request(app.getHttpServer()).patch('/events/some-id/publish');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /events/:id/cancel', () => {
    it('should return 401 without auth token', async () => { // VERIFY:EM-EVT-V05 — cancel requires authentication
      const response = await request(app.getHttpServer()).patch('/events/some-id/cancel');
      expect(response.status).toBe(401);
    });
  });
});
