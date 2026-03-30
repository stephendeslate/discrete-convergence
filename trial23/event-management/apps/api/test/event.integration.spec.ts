import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers/test-app';

describe('Event Integration', () => {
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
    // Restore default mock behaviors
    prisma.event.findFirst.mockResolvedValue({
      id: 'event-uuid-001',
      name: 'Test Event',
      description: 'A test event',
      startDate: new Date('2026-06-01T10:00:00.000Z'),
      endDate: new Date('2026-06-01T18:00:00.000Z'),
      status: 'DRAFT',
      venueId: null,
      organizationId: 'org-uuid-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.event.findMany.mockResolvedValue([
      {
        id: 'event-uuid-001',
        name: 'Test Event',
        description: 'A test event',
        startDate: new Date('2026-06-01T10:00:00.000Z'),
        endDate: new Date('2026-06-01T18:00:00.000Z'),
        status: 'DRAFT',
        venueId: null,
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.event.count.mockResolvedValue(1);
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

  function authDelete(path: string) {
    return request(app.getHttpServer())
      .delete(path)
      .set('Authorization', `Bearer ${token}`);
  }

  describe('POST /events', () => {
    it('should create an event', async () => {
      prisma.event.create.mockResolvedValueOnce({
        id: 'event-new-001',
        name: 'Created Event',
        description: 'Desc',
        startDate: new Date('2026-06-01T10:00:00.000Z'),
        endDate: new Date('2026-06-01T18:00:00.000Z'),
        status: 'DRAFT',
        venueId: null,
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authPost('/events')
        .send({
          name: 'Created Event',
          description: 'Desc',
          startDate: '2026-06-01T10:00:00.000Z',
          endDate: '2026-06-01T18:00:00.000Z',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Created Event');
      expect(res.body.status).toBe('DRAFT');
    });

    it('should reject event with invalid data (missing name) with 400', async () => {
      const res = await authPost('/events')
        .send({
          startDate: '2026-06-01T10:00:00.000Z',
          endDate: '2026-06-01T18:00:00.000Z',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('GET /events', () => {
    it('should return paginated list', async () => {
      const res = await authGet('/events').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should respect pagination params', async () => {
      const res = await authGet('/events?page=1&limit=5').expect(200);

      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(5);
    });

    it('should have Cache-Control header', async () => {
      const res = await authGet('/events').expect(200);

      expect(res.headers['cache-control']).toBe('private, no-cache');
    });
  });

  describe('GET /events/:id', () => {
    it('should return a single event', async () => {
      const res = await authGet('/events/event-uuid-001').expect(200);

      expect(res.body.id).toBe('event-uuid-001');
      expect(res.body.name).toBe('Test Event');
    });

    it('should return 404 for non-existent event', async () => {
      prisma.event.findFirst.mockResolvedValueOnce(null);

      const res = await authGet('/events/00000000-0000-0000-0000-000000000000').expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PATCH /events/:id', () => {
    it('should update event', async () => {
      prisma.event.update.mockResolvedValueOnce({
        id: 'event-uuid-001',
        name: 'Updated Event',
        description: 'A test event',
        startDate: new Date('2026-06-01T10:00:00.000Z'),
        endDate: new Date('2026-06-01T18:00:00.000Z'),
        status: 'DRAFT',
        venueId: null,
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authPatch('/events/event-uuid-001')
        .send({ name: 'Updated Event' })
        .expect(200);

      expect(res.body.name).toBe('Updated Event');
    });
  });

  describe('DELETE /events/:id', () => {
    it('should remove event', async () => {
      prisma.event.delete.mockResolvedValueOnce({
        id: 'event-uuid-001',
        name: 'Test Event',
        organizationId: 'org-uuid-001',
      });

      await authDelete('/events/event-uuid-001').expect(200);

      expect(prisma.event.delete).toHaveBeenCalled();
    });
  });
});
