// TRACED: EM-API-003 — Event integration tests
// These tests require a running database
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './helpers/test-app';

describe('Event Integration (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await getAuthToken(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /events — should create an event', async () => {
    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Conference',
        description: 'Annual tech conference',
        startDate: '2025-09-01T09:00:00Z',
        endDate: '2025-09-03T17:00:00Z',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /events — should list events', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /events/:id — should get a single event', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Single Event',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z',
      });

    const res = await request(app.getHttpServer())
      .get(`/events/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Single Event');
  });

  it('POST /events/:id/publish — should publish an event', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Pub Event',
        startDate: '2025-11-01T09:00:00Z',
        endDate: '2025-11-01T17:00:00Z',
      });

    const res = await request(app.getHttpServer())
      .post(`/events/${createRes.body.id}/publish`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('PUBLISHED');
  });

  it('POST /events — should reject invalid dates', async () => {
    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bad Dates',
        startDate: '2025-12-31T00:00:00Z',
        endDate: '2025-01-01T00:00:00Z',
      });

    expect(res.status).toBe(400);
  });

  it('GET /events — should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/events');
    expect(res.status).toBe(401);
  });

  it('GET /events/:id — should return 404 for unknown event', async () => {
    const res = await request(app.getHttpServer())
      .get('/events/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('PATCH /events/:id — should update an event', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Patchable Event',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z',
      });

    const res = await request(app.getHttpServer())
      .patch(`/events/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Event Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Event Name');
  });

  it('DELETE /events/:id — should delete a draft event', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Deletable Event',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z',
      });

    await request(app.getHttpServer())
      .delete(`/events/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('POST /events/:id/cancel — should cancel an event', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cancellable Event',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z',
      });

    const res = await request(app.getHttpServer())
      .post(`/events/${createRes.body.id}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('CANCELLED');
  });

  it('GET /audit-log — should restrict to ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .get('/audit-log')
      .set('Authorization', `Bearer ${token}`);

    // Registered users have MEMBER role, audit-log requires ADMIN
    expect(res.status).toBe(403);
  });

  it('POST /events/:id/ticket-types — should create a ticket type', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Ticketed Event',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z',
      });

    const res = await request(app.getHttpServer())
      .post(`/events/${createRes.body.id}/ticket-types`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'General Admission', price: 25.00, quantity: 100 });

    expect([200, 201]).toContain(res.status);
    expect(res.body.name).toBe('General Admission');
  });

  it('GET /events/:id/ticket-types — should list ticket types', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Event With Tickets',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z',
      });

    const res = await request(app.getHttpServer())
      .get(`/events/${createRes.body.id}/ticket-types`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /events/:id/registrations — should list registrations', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Reg Event',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z',
      });

    const res = await request(app.getHttpServer())
      .get(`/events/${createRes.body.id}/registrations`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
