import request from 'supertest';
import { setupTestContext, cleanupTestContext, authHeader, TestContext, getMockPrisma } from './helpers/test-setup';

// TRACED: EM-TEST-006 — Cross-layer integration tests (VERIFY: EM-CROSS-001 through EM-CROSS-004)

describe('Cross-Layer Integration', () => {
  let ctx: TestContext;
  let mockPrisma: ReturnType<typeof getMockPrisma>;

  beforeAll(async () => {
    ctx = await setupTestContext();
    mockPrisma = getMockPrisma();
  });

  afterAll(async () => {
    await cleanupTestContext(ctx);
  });

  // VERIFY: EM-CROSS-001 — Event + Venue association flow
  it('should create a venue, then an event at that venue', async () => {
    const venueId = '21917cca-a444-49fc-9bcb-4fdb340a7d60';
    mockPrisma.venue.create.mockResolvedValue({
      id: venueId,
      name: 'Cross Layer Venue',
      address: '456 Test Rd',
      city: 'Testing City',
      country: 'US',
      capacity: 200,
      tenantId: ctx.tenantId,
    });

    const venueRes = await request(ctx.app.getHttpServer())
      .post('/venues')
      .set(authHeader(ctx.adminToken))
      .send({
        name: 'Cross Layer Venue',
        address: '456 Test Rd',
        city: 'Testing City',
        country: 'US',
        capacity: 200,
      });

    expect(venueRes.status).toBe(201);
    expect(venueRes.body).toHaveProperty('id');

    const eventId = '9a695283-2690-471d-b1b3-051e815b2943';
    mockPrisma.event.create.mockResolvedValue({
      id: eventId,
      title: 'Event at Venue',
      venueId: venueRes.body.id,
      tenantId: ctx.tenantId,
    });

    const eventRes = await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.adminToken))
      .send({
        title: 'Event at Venue',
        startDate: '2025-08-01T09:00:00Z',
        endDate: '2025-08-01T17:00:00Z',
        venueId: venueRes.body.id,
      });

    expect(eventRes.status).toBe(201);
    expect(eventRes.body.venueId).toBe(venueRes.body.id);

    // Verify event detail includes venue
    mockPrisma.event.findFirst.mockResolvedValue({
      id: eventId,
      title: 'Event at Venue',
      venueId,
      tenantId: ctx.tenantId,
      venue: { id: venueId, name: 'Cross Layer Venue' },
      tickets: [],
      schedules: [],
    });

    const detailRes = await request(ctx.app.getHttpServer())
      .get(`/events/${eventId}`)
      .set(authHeader(ctx.adminToken));

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.venue).toBeDefined();
    expect(detailRes.body.venue.name).toBe('Cross Layer Venue');
  });

  // VERIFY: EM-CROSS-002 — Event + Ticket + Schedule full flow
  it('should create event with ticket and schedule', async () => {
    const eventId = 'a6ec91a3-a43b-4b1a-9c82-5651d84f471c';
    mockPrisma.event.create.mockResolvedValue({
      id: eventId,
      title: 'Full Flow Event',
      tenantId: ctx.tenantId,
    });

    const eventRes = await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.adminToken))
      .send({
        title: 'Full Flow Event',
        startDate: '2025-07-01T09:00:00Z',
        endDate: '2025-07-01T17:00:00Z',
      });

    expect(eventRes.status).toBe(201);

    mockPrisma.ticket.create.mockResolvedValue({
      id: 'cross-ticket-1',
      eventId,
      type: 'GENERAL',
      price: 75.0,
      tenantId: ctx.tenantId,
    });

    const ticketRes = await request(ctx.app.getHttpServer())
      .post('/tickets')
      .set(authHeader(ctx.adminToken))
      .send({ eventId, type: 'GENERAL', price: 75.0 });

    expect(ticketRes.status).toBe(201);
    expect(ticketRes.body.eventId).toBe(eventId);

    mockPrisma.schedule.create.mockResolvedValue({
      id: 'cross-schedule-1',
      eventId,
      title: 'Opening Session',
      startTime: new Date('2025-07-01T09:00:00Z'),
      endTime: new Date('2025-07-01T10:00:00Z'),
      room: 'Room A',
      speaker: 'Jane Doe',
      tenantId: ctx.tenantId,
      event: {},
    });

    const scheduleRes = await request(ctx.app.getHttpServer())
      .post('/schedules')
      .set(authHeader(ctx.adminToken))
      .send({
        eventId,
        title: 'Opening Session',
        startTime: '2025-07-01T09:00:00Z',
        endTime: '2025-07-01T10:00:00Z',
        room: 'Room A',
        speaker: 'Jane Doe',
      });

    expect(scheduleRes.status).toBe(201);
    expect(scheduleRes.body.eventId).toBe(eventId);

    // Verify event detail includes both
    mockPrisma.event.findFirst.mockResolvedValue({
      id: eventId,
      title: 'Full Flow Event',
      tenantId: ctx.tenantId,
      venue: null,
      tickets: [{ id: 'cross-ticket-1', type: 'GENERAL' }],
      schedules: [{ id: 'cross-schedule-1', title: 'Opening Session' }],
    });

    const detailRes = await request(ctx.app.getHttpServer())
      .get(`/events/${eventId}`)
      .set(authHeader(ctx.adminToken));

    expect(detailRes.body.tickets).toBeDefined();
    expect(detailRes.body.tickets.length).toBeGreaterThanOrEqual(1);
    expect(detailRes.body.schedules).toBeDefined();
    expect(detailRes.body.schedules.length).toBeGreaterThanOrEqual(1);
  });

  // VERIFY: EM-CROSS-003 — Attendee registration flow
  it('should register an attendee for an event', async () => {
    const eventId = 'acd57ff0-357c-40eb-bbbe-4b765c36a9ee';
    const userId = '708ad30e-8a0d-4e8d-8617-59234804ae5c';

    // Create event
    mockPrisma.event.create.mockResolvedValue({
      id: eventId,
      title: 'Attendee Test Event',
      tenantId: ctx.tenantId,
    });

    await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.adminToken))
      .send({
        title: 'Attendee Test Event',
        startDate: '2025-06-01T09:00:00Z',
        endDate: '2025-06-01T17:00:00Z',
      });

    // Mock attendee creation (no duplicate found)
    mockPrisma.attendee.findFirst.mockResolvedValue(null);
    mockPrisma.attendee.create.mockResolvedValue({
      id: 'attendee-1',
      eventId,
      userId,
      tenantId: ctx.tenantId,
      event: { id: eventId },
      user: { id: userId },
    });

    const attendeeRes = await request(ctx.app.getHttpServer())
      .post('/attendees')
      .set(authHeader(ctx.adminToken))
      .send({
        eventId,
        userId,
      });

    expect(attendeeRes.status).toBe(201);
    expect(attendeeRes.body.eventId).toBe(eventId);
    expect(attendeeRes.body.userId).toBe(userId);
  });

  // VERIFY: EM-CROSS-004 — Duplicate attendee registration returns 409
  it('should reject duplicate attendee registration', async () => {
    const eventId = '79b5862e-443e-4af1-847a-2630de66758b';
    const userId = '952c5e12-6adb-42af-9194-5d0cff604ed4';

    // Create event
    mockPrisma.event.create.mockResolvedValue({
      id: eventId,
      title: 'Dup Attendee Event',
      tenantId: ctx.tenantId,
    });

    await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.adminToken))
      .send({
        title: 'Dup Attendee Event',
        startDate: '2025-05-01T09:00:00Z',
        endDate: '2025-05-01T17:00:00Z',
      });

    // First registration — no existing found
    mockPrisma.attendee.findFirst.mockResolvedValueOnce(null);
    mockPrisma.attendee.create.mockResolvedValue({
      id: 'attendee-dup-1',
      eventId,
      userId,
      tenantId: ctx.tenantId,
      event: {},
      user: {},
    });

    await request(ctx.app.getHttpServer())
      .post('/attendees')
      .set(authHeader(ctx.adminToken))
      .send({ eventId, userId });

    // Duplicate — existing found
    mockPrisma.attendee.findFirst.mockResolvedValueOnce({
      id: 'attendee-dup-1',
      eventId,
      userId,
      tenantId: ctx.tenantId,
    });

    const dupRes = await request(ctx.app.getHttpServer())
      .post('/attendees')
      .set(authHeader(ctx.adminToken))
      .send({ eventId, userId });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.message).toContain('already registered');
  });
});
