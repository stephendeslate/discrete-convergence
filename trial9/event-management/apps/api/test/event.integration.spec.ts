import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import type { Server } from 'http';

describe('Event Integration', () => {
  let app: INestApplication;
  let server: Server;
  let jwtService: JwtService;
  let token: string;
  let prisma: Record<string, unknown>;

  const tenantId = 'tenant-1';

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    venue: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    attendee: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    schedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeAll(async () => {
    prisma = mockPrisma;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
    jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
      tenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
  });

  describe('POST /events', () => {
    it('should create an event', async () => {
      const mockEvent = {
        id: 'event-1',
        title: 'Test Event',
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-16'),
        status: 'DRAFT',
        tenantId,
        venueId: 'venue-1',
        venue: { id: 'venue-1', name: 'Venue' },
      };
      mockPrisma.event.create.mockResolvedValue(mockEvent);

      const response = await request(server)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Event',
          startDate: '2025-06-15T09:00:00Z',
          endDate: '2025-06-16T17:00:00Z',
          venueId: 'venue-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Event');
    });

    it('should reject unauthorized requests', async () => {
      const response = await request(server)
        .post('/events')
        .send({ title: 'Test Event' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should reject invalid event data', async () => {
      const response = await request(server)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /events', () => {
    it('should return paginated events', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const response = await request(server)
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.headers['cache-control']).toContain('max-age');
    });

    it('should return X-Response-Time header', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const response = await request(server)
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('GET /events/:id', () => {
    it('should return a single event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        title: 'Test',
        tenantId,
        tickets: [],
        schedules: [],
        attendees: [],
        venue: { id: 'v1' },
      });

      const response = await request(server)
        .get('/events/event-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('event-1');
    });

    it('should return 404 for non-existent event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const response = await request(server)
        .get('/events/non-existent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /events/:id', () => {
    it('should update an event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        title: 'Old',
        status: 'DRAFT',
        tenantId,
        tickets: [],
        schedules: [],
        attendees: [],
        venue: { id: 'v1' },
      });
      mockPrisma.event.update.mockResolvedValue({
        id: 'event-1',
        title: 'Updated',
        tenantId,
        venue: { id: 'v1' },
      });

      const response = await request(server)
        .put('/events/event-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated');
    });
  });

  describe('DELETE /events/:id', () => {
    it('should delete an event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        tenantId,
        tickets: [],
        schedules: [],
        attendees: [],
        venue: { id: 'v1' },
      });
      mockPrisma.event.delete.mockResolvedValue({ id: 'event-1' });

      const response = await request(server)
        .delete('/events/event-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('event-1');
    });
  });

  describe('POST /venues', () => {
    it('should create a venue', async () => {
      mockPrisma.venue.create.mockResolvedValue({
        id: 'venue-1',
        name: 'New Venue',
        address: '123 St',
        capacity: 100,
        tenantId,
      });

      const response = await request(server)
        .post('/venues')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Venue', address: '123 St', capacity: 100 });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Venue');
    });
  });

  describe('Attendee duplicate registration', () => {
    it('should return 409 for duplicate attendee registration', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue({ id: 'att-1' });

      const response = await request(server)
        .post('/attendees')
        .set('Authorization', `Bearer ${token}`)
        .send({ eventId: 'event-1', userId: 'user-1' });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already registered');
    });
  });

  describe('Schedules', () => {
    it('should create a schedule', async () => {
      mockPrisma.schedule.create.mockResolvedValue({
        id: 'sched-1',
        title: 'Keynote',
        tenantId,
        event: { id: 'event-1' },
      });

      const response = await request(server)
        .post('/schedules')
        .set('Authorization', `Bearer ${token}`)
        .send({
          eventId: 'event-1',
          title: 'Keynote',
          startTime: '2025-06-15T09:00:00Z',
          endTime: '2025-06-15T10:00:00Z',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Keynote');
    });

    it('should reject schedule with end before start', async () => {
      const response = await request(server)
        .post('/schedules')
        .set('Authorization', `Bearer ${token}`)
        .send({
          eventId: 'event-1',
          title: 'Bad Schedule',
          startTime: '2025-06-15T10:00:00Z',
          endTime: '2025-06-15T09:00:00Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Tickets', () => {
    it('should create a ticket', async () => {
      mockPrisma.ticket.create.mockResolvedValue({
        id: 'ticket-1',
        type: 'VIP',
        price: 99.99,
        status: 'AVAILABLE',
        tenantId,
        event: { id: 'event-1' },
      });

      const response = await request(server)
        .post('/tickets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          eventId: 'event-1',
          type: 'VIP',
          price: 99.99,
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('VIP');
    });

    it('should return 401 when deleting ticket without admin role', async () => {
      const userToken = jwtService.sign({
        sub: 'user-2',
        email: 'user@example.com',
        role: 'USER',
        tenantId,
      });

      const response = await request(server)
        .delete('/tickets/ticket-1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBeDefined();
    });
  });
});
