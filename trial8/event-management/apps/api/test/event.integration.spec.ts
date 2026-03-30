import request from 'supertest';
import { setupTestContext, cleanupTestContext, authHeader, TestContext, getMockPrisma } from './helpers/test-setup';

// TRACED: EM-TEST-003 — Event integration tests (VERIFY: EM-API-001 through EM-API-003)

describe('Event Integration', () => {
  let ctx: TestContext;
  let eventId: string;
  let mockPrisma: ReturnType<typeof getMockPrisma>;

  beforeAll(async () => {
    ctx = await setupTestContext();
    mockPrisma = getMockPrisma();
  });

  afterAll(async () => {
    await cleanupTestContext(ctx);
  });

  // VERIFY: EM-API-001 — Create event with admin role succeeds
  it('should create an event as admin', async () => {
    const created = {
      id: 'event-1',
      title: 'Integration Test Event',
      description: 'A test event',
      startDate: new Date('2025-12-01T09:00:00Z'),
      endDate: new Date('2025-12-01T17:00:00Z'),
      status: 'DRAFT',
      tenantId: ctx.tenantId,
    };
    mockPrisma.event.create.mockResolvedValue(created);

    const res = await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.adminToken))
      .send({
        title: 'Integration Test Event',
        description: 'A test event',
        startDate: '2025-12-01T09:00:00Z',
        endDate: '2025-12-01T17:00:00Z',
        status: 'DRAFT',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Integration Test Event');
    expect(res.body.status).toBe('DRAFT');
    eventId = res.body.id;
  });

  // VERIFY: EM-API-001 — Create event with organizer role succeeds
  it('should create an event as organizer', async () => {
    const created = {
      id: 'event-2',
      title: 'Organizer Event',
      startDate: new Date('2025-11-01T09:00:00Z'),
      endDate: new Date('2025-11-01T17:00:00Z'),
      status: 'DRAFT',
      tenantId: ctx.tenantId,
    };
    mockPrisma.event.create.mockResolvedValue(created);

    const res = await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.organizerToken))
      .send({
        title: 'Organizer Event',
        startDate: '2025-11-01T09:00:00Z',
        endDate: '2025-11-01T17:00:00Z',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Organizer Event');
  });

  // VERIFY: EM-SEC-003 — Regular user cannot create events (role guard)
  it('should reject event creation by regular user', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.userToken))
      .send({
        title: 'Unauthorized Event',
        startDate: '2025-10-01T09:00:00Z',
        endDate: '2025-10-01T17:00:00Z',
      });

    expect(res.status).toBe(403);
  });

  // VERIFY: EM-API-002 — List events returns paginated results
  it('should list events with pagination', async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      { id: 'event-1', title: 'Event 1', tenantId: ctx.tenantId },
    ]);
    mockPrisma.event.count.mockResolvedValue(1);

    const res = await request(ctx.app.getHttpServer())
      .get('/events?page=1&pageSize=10')
      .set(authHeader(ctx.adminToken));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // VERIFY: EM-API-003 — Get single event by ID
  it('should get event by id', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: eventId,
      title: 'Integration Test Event',
      tenantId: ctx.tenantId,
      venue: null,
      tickets: [],
      schedules: [],
    });

    const res = await request(ctx.app.getHttpServer())
      .get(`/events/${eventId}`)
      .set(authHeader(ctx.adminToken));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(eventId);
    expect(res.body.title).toBe('Integration Test Event');
  });

  // VERIFY: EM-API-003 — Get non-existent event returns 404
  it('should return 404 for non-existent event', async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app.getHttpServer())
      .get('/events/00000000-0000-0000-0000-000000000000')
      .set(authHeader(ctx.adminToken));

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });

  // VERIFY: EM-API-001 — Update event succeeds
  it('should update an event', async () => {
    // findOne called first by update
    mockPrisma.event.findFirst.mockResolvedValue({
      id: eventId,
      title: 'Integration Test Event',
      tenantId: ctx.tenantId,
      venue: null,
      tickets: [],
      schedules: [],
    });
    mockPrisma.event.update.mockResolvedValue({
      id: eventId,
      title: 'Updated Event Title',
      status: 'PUBLISHED',
      tenantId: ctx.tenantId,
    });

    const res = await request(ctx.app.getHttpServer())
      .put(`/events/${eventId}`)
      .set(authHeader(ctx.adminToken))
      .send({ title: 'Updated Event Title', status: 'PUBLISHED' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Event Title');
    expect(res.body.status).toBe('PUBLISHED');
  });

  // VERIFY: EM-API-001 — Delete event with admin role succeeds
  it('should delete an event as admin', async () => {
    const deleteEventId = 'event-to-delete';

    // Mock create for the throwaway event
    mockPrisma.event.create.mockResolvedValue({
      id: deleteEventId,
      title: 'To Delete',
      tenantId: ctx.tenantId,
    });

    const createRes = await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.adminToken))
      .send({
        title: 'To Delete',
        startDate: '2025-09-01T09:00:00Z',
        endDate: '2025-09-01T17:00:00Z',
      });

    // Mock findOne for delete validation, then mock delete
    mockPrisma.event.findFirst.mockResolvedValueOnce({
      id: deleteEventId,
      title: 'To Delete',
      tenantId: ctx.tenantId,
      venue: null,
      tickets: [],
      schedules: [],
    });
    mockPrisma.event.delete.mockResolvedValue({ id: deleteEventId });

    const deleteRes = await request(ctx.app.getHttpServer())
      .delete(`/events/${createRes.body.id}`)
      .set(authHeader(ctx.adminToken));

    expect(deleteRes.status).toBe(200);

    // Confirm it's gone
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const getRes = await request(ctx.app.getHttpServer())
      .get(`/events/${createRes.body.id}`)
      .set(authHeader(ctx.adminToken));

    expect(getRes.status).toBe(404);
  });

  // VERIFY: EM-DATA-010 — Validation rejects end date before start date
  it('should reject event with end date before start date', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.adminToken))
      .send({
        title: 'Bad Dates Event',
        startDate: '2025-12-02T09:00:00Z',
        endDate: '2025-12-01T09:00:00Z',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});
