import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-EVENT-006
describe('Event Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;
  let prisma: {
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $on: jest.Mock;
    $queryRaw: jest.Mock;
    $executeRaw: jest.Mock;
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'A test event',
    startDate: new Date('2026-06-15'),
    endDate: new Date('2026-06-16'),
    status: 'DRAFT',
    capacity: 100,
    tenantId,
    venueId: 'venue-1',
    venue: { id: 'venue-1', name: 'Test Venue' },
    schedules: [],
    tickets: [],
  };

  beforeAll(async () => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      $executeRaw: jest.fn().mockResolvedValue(1),
    };

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

    jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'ORGANIZER',
      tenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /events', () => {
    it('should return events with cache-control header', async () => {
      prisma.event.findMany.mockResolvedValue([mockEvent]);
      prisma.event.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBeDefined();
    });

    it('should return x-response-time header', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('POST /events', () => {
    it('should create an event', async () => {
      prisma.event.create.mockResolvedValue(mockEvent);

      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Event',
          description: 'A new event',
          startDate: '2026-06-15T09:00:00Z',
          endDate: '2026-06-16T17:00:00Z',
          capacity: 100,
          venueId: 'venue-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Event');
    });

    it('should return 400 for invalid event data', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject forbidden fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Event',
          description: 'Desc',
          startDate: '2026-06-15T09:00:00Z',
          endDate: '2026-06-16T17:00:00Z',
          capacity: 100,
          venueId: 'venue-1',
          hackerField: 'malicious',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /events/:id', () => {
    it('should return a single event', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);

      const response = await request(app.getHttpServer())
        .get('/events/event-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('event-1');
    });

    it('should return 404 for non-existent event', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/events/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('DELETE /events/:id', () => {
    it('should return 401 without auth', async () => {
      const response = await request(app.getHttpServer())
        .delete('/events/event-1');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });
});
