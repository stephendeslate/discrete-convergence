import request from 'supertest';
import { setupTestContext, cleanupTestContext, authHeader, TestContext, getMockPrisma } from './helpers/test-setup';

// TRACED: EM-TEST-004 — Ticket integration tests (VERIFY: EM-API-004 through EM-API-005)

describe('Ticket Integration', () => {
  let ctx: TestContext;
  let eventId: string;
  let ticketId: string;
  let mockPrisma: ReturnType<typeof getMockPrisma>;

  beforeAll(async () => {
    ctx = await setupTestContext();
    mockPrisma = getMockPrisma();
    eventId = '6d8aa444-38e1-432c-becc-00a27b450cd0';

    // Mock creating the event in beforeAll
    mockPrisma.event.create.mockResolvedValue({
      id: eventId,
      title: 'Ticket Test Event',
      tenantId: ctx.tenantId,
    });

    await request(ctx.app.getHttpServer())
      .post('/events')
      .set(authHeader(ctx.adminToken))
      .send({
        title: 'Ticket Test Event',
        startDate: '2025-12-01T09:00:00Z',
        endDate: '2025-12-01T17:00:00Z',
      });
  });

  afterAll(async () => {
    await cleanupTestContext(ctx);
  });

  // VERIFY: EM-API-004 — Create ticket succeeds for admin
  it('should create a ticket as admin', async () => {
    ticketId = 'ticket-1';
    mockPrisma.ticket.create.mockResolvedValue({
      id: ticketId,
      eventId,
      type: 'GENERAL',
      price: 49.99,
      status: 'AVAILABLE',
      tenantId: ctx.tenantId,
    });

    const res = await request(ctx.app.getHttpServer())
      .post('/tickets')
      .set(authHeader(ctx.adminToken))
      .send({
        eventId,
        type: 'GENERAL',
        price: 49.99,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.eventId).toBe(eventId);
    expect(res.body.type).toBe('GENERAL');
  });

  // VERIFY: EM-API-004 — Create VIP ticket with organizer role
  it('should create a VIP ticket as organizer', async () => {
    mockPrisma.ticket.create.mockResolvedValue({
      id: 'ticket-vip',
      eventId,
      type: 'VIP',
      price: 199.99,
      status: 'AVAILABLE',
      tenantId: ctx.tenantId,
    });

    const res = await request(ctx.app.getHttpServer())
      .post('/tickets')
      .set(authHeader(ctx.organizerToken))
      .send({
        eventId,
        type: 'VIP',
        price: 199.99,
      });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('VIP');
  });

  // VERIFY: EM-SEC-004 — Regular user cannot create tickets
  it('should reject ticket creation by regular user', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/tickets')
      .set(authHeader(ctx.userToken))
      .send({
        eventId,
        type: 'GENERAL',
        price: 25.0,
      });

    expect(res.status).toBe(403);
  });

  // VERIFY: EM-API-005 — List tickets returns paginated data
  it('should list tickets', async () => {
    mockPrisma.ticket.findMany.mockResolvedValue([
      { id: ticketId, eventId, type: 'GENERAL', price: 49.99, tenantId: ctx.tenantId, event: {} },
    ]);
    mockPrisma.ticket.count.mockResolvedValue(1);

    const res = await request(ctx.app.getHttpServer())
      .get('/tickets')
      .set(authHeader(ctx.adminToken));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  // VERIFY: EM-API-005 — Get ticket by ID
  it('should get ticket by id', async () => {
    mockPrisma.ticket.findFirst.mockResolvedValue({
      id: ticketId,
      eventId,
      type: 'GENERAL',
      price: 49.99,
      tenantId: ctx.tenantId,
      event: { id: eventId, title: 'Ticket Test Event' },
      attendee: null,
    });

    const res = await request(ctx.app.getHttpServer())
      .get(`/tickets/${ticketId}`)
      .set(authHeader(ctx.adminToken));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ticketId);
    expect(res.body).toHaveProperty('event');
  });

  // VERIFY: EM-API-004 — Update ticket status
  it('should update ticket status', async () => {
    // findOne check
    mockPrisma.ticket.findFirst.mockResolvedValue({
      id: ticketId,
      eventId,
      type: 'GENERAL',
      status: 'AVAILABLE',
      tenantId: ctx.tenantId,
      event: {},
      attendee: null,
    });
    mockPrisma.ticket.update.mockResolvedValue({
      id: ticketId,
      eventId,
      type: 'GENERAL',
      status: 'SOLD',
      tenantId: ctx.tenantId,
    });

    const res = await request(ctx.app.getHttpServer())
      .put(`/tickets/${ticketId}`)
      .set(authHeader(ctx.adminToken))
      .send({ status: 'SOLD' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SOLD');
  });

  // VERIFY: EM-API-005 — Non-existent ticket returns 404
  it('should return 404 for non-existent ticket', async () => {
    mockPrisma.ticket.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app.getHttpServer())
      .get('/tickets/00000000-0000-0000-0000-000000000000')
      .set(authHeader(ctx.adminToken));

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });

  // VERIFY: EM-DATA-004 — Validation rejects invalid ticket type
  it('should reject invalid ticket type', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/tickets')
      .set(authHeader(ctx.adminToken))
      .send({
        eventId,
        type: 'INVALID_TYPE',
        price: 10.0,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});
