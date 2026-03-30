import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers/test-app';

describe('Registration Integration', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof import('./helpers/test-app')['buildMockPrismaService']>['prisma'];
  let token: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    token = generateTestToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.event.findFirst.mockResolvedValue({
      id: 'event-uuid-001',
      name: 'Test Event',
      description: 'A test event',
      startDate: new Date('2026-06-01T10:00:00.000Z'),
      endDate: new Date('2026-06-01T18:00:00.000Z'),
      status: 'PUBLISHED',
      venueId: null,
      organizationId: 'org-uuid-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.registration.findFirst.mockResolvedValue({
      id: 'reg-uuid-001',
      eventId: 'event-uuid-001',
      ticketTypeId: 'ticket-uuid-001',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
      status: 'PENDING',
      organizationId: 'org-uuid-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.registration.findMany.mockResolvedValue([
      {
        id: 'reg-uuid-001',
        eventId: 'event-uuid-001',
        ticketTypeId: 'ticket-uuid-001',
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
        status: 'PENDING',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.registration.count.mockResolvedValue(1);
  });

  function authGet(path: string) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function authPost(path: string) {
    return request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function authPatch(path: string) {
    return request(app.getHttpServer())
      .patch(path)
      .set('Authorization', `Bearer ${token}`);
  }

  describe('POST /events/:id/register', () => {
    it('should create a registration', async () => {
      prisma.registration.create.mockResolvedValueOnce({
        id: 'reg-new-001',
        eventId: 'event-uuid-001',
        ticketTypeId: 'ticket-uuid-001',
        attendeeName: 'John Smith',
        attendeeEmail: 'john@example.com',
        status: 'PENDING',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authPost('/events/event-uuid-001/register')
        .send({
          ticketTypeId: 'ticket-uuid-001',
          attendeeName: 'John Smith',
          attendeeEmail: 'john@example.com',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.attendeeName).toBe('John Smith');
      expect(res.body.status).toBe('PENDING');
    });

    it('should return 404 for non-existent event', async () => {
      prisma.event.findFirst.mockResolvedValueOnce(null);

      const res = await authPost('/events/fake-event-id/register')
        .send({
          ticketTypeId: 'ticket-uuid-001',
          attendeeName: 'Nobody',
          attendeeEmail: 'nobody@example.com',
        })
        .expect(404);

      expect(res.body.statusCode).toBe(404);
    });

    it('should return 400 when registration create fails', async () => {
      prisma.registration.create.mockRejectedValueOnce(new Error('Capacity exceeded'));

      const res = await authPost('/events/event-uuid-001/register')
        .send({
          ticketTypeId: 'ticket-uuid-001',
          attendeeName: 'Over Limit',
          attendeeEmail: 'over@example.com',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toContain('Registration failed');
    });
  });

  describe('GET /events/:id/registrations', () => {
    it('should return paginated list of registrations', async () => {
      const res = await authGet('/events/event-uuid-001/registrations').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 404 for registrations of non-existent event', async () => {
      prisma.event.findFirst.mockResolvedValueOnce(null);

      const res = await authGet('/events/fake-event-id/registrations').expect(404);

      expect(res.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /registrations/:id/cancel', () => {
    it('should cancel a registration', async () => {
      prisma.registration.update.mockResolvedValueOnce({
        id: 'reg-uuid-001',
        eventId: 'event-uuid-001',
        ticketTypeId: 'ticket-uuid-001',
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
        status: 'CANCELLED',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authPatch('/registrations/reg-uuid-001/cancel').expect(200);

      expect(res.body.status).toBe('CANCELLED');
    });

    it('should return 404 for non-existent registration', async () => {
      prisma.registration.findFirst.mockResolvedValueOnce(null);

      const res = await authPatch('/registrations/fake-reg-id/cancel').expect(404);

      expect(res.body.statusCode).toBe(404);
    });
  });
});
