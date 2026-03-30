import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getTestAuthToken, getTestAdminToken, getMockPrisma } from './helpers/test-utils';

describe('Event Integration', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = getTestAuthToken(app);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    const mockPrisma = getMockPrisma();
    mockPrisma.event.findMany.mockResolvedValue([]);
    mockPrisma.event.count.mockResolvedValue(0);
    mockPrisma.event.findFirst.mockResolvedValue(null);
  });

  describe('GET /events', () => {
    it('should return paginated events for tenant', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.page).toBeDefined();
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/events');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should support pagination query params', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.limit).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /events/:id', () => {
    it('should return 404 for non-existent event', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found');
    });
  });

  describe('POST /events', () => {
    it('should reject event with missing required fields', async () => {
      const adminToken = getTestAdminToken(app);
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Missing dates' });

      expect(res.status).toBe(400);
      expect(res.body.statusCode).toBe(400);
    });

    it('should reject event creation for non-admin users', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Bad Date', startDate: 'not-a-date', endDate: 'also-not-a-date' });

      expect(res.status).toBe(403);
      expect(res.body.statusCode).toBe(403);
    });
  });
});
