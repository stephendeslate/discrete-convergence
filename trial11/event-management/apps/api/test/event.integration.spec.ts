import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('Event Integration', () => {
  let app: INestApplication;
  let jwtToken: string;

  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'A test event',
    status: 'DRAFT',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-02'),
    venueId: 'venue-1',
    tenantId: testTenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    venue: { id: 'venue-1', name: 'Test Venue', address: '123 St', capacity: 100, tenantId: testTenantId },
  };

  const mockPrisma = {
    event: {
      create: jest.fn().mockResolvedValue(mockEvent),
      findMany: jest.fn().mockResolvedValue([mockEvent]),
      findUnique: jest.fn().mockResolvedValue(mockEvent),
      update: jest.fn().mockResolvedValue({ ...mockEvent, title: 'Updated' }),
      delete: jest.fn().mockResolvedValue(mockEvent),
      count: jest.fn().mockResolvedValue(1),
    },
    venue: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    ticket: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    schedule: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    attendee: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ status: 'ok' }]),
    $executeRaw: jest.fn().mockResolvedValue(1),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
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

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'ORGANIZER',
      tenantId: testTenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.event.findMany.mockResolvedValue([mockEvent]);
    mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
    mockPrisma.event.create.mockResolvedValue(mockEvent);
    mockPrisma.event.update.mockResolvedValue({ ...mockEvent, title: 'Updated' });
    mockPrisma.event.delete.mockResolvedValue(mockEvent);
    mockPrisma.event.count.mockResolvedValue(1);
  });

  describe('GET /events', () => {
    it('should return paginated events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: testTenantId } }),
      );
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('GET /events/:id', () => {
    it('should return a single event', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/event-1')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.id).toBe('event-1');
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'event-1' } }),
      );
    });

    it('should return 404 for non-existent event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/events/not-found')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(mockPrisma.event.findUnique).toHaveBeenCalled();
    });
  });

  describe('POST /events', () => {
    it('should create a new event', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'New Event',
          startDate: '2025-06-01T00:00:00Z',
          endDate: '2025-06-02T00:00:00Z',
          venueId: 'venue-1',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(mockPrisma.event.create).toHaveBeenCalled();
    });

    it('should reject invalid event data', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: '',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject event without auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({
          title: 'Test',
          startDate: '2025-06-01T00:00:00Z',
          endDate: '2025-06-02T00:00:00Z',
          venueId: 'venue-1',
        })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('PUT /events/:id', () => {
    it('should update an event', async () => {
      const response = await request(app.getHttpServer())
        .put('/events/event-1')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: 'Updated Event' })
        .expect(200);

      expect(response.body.title).toBe('Updated');
      expect(mockPrisma.event.update).toHaveBeenCalled();
    });

    it('should return 404 when updating non-existent event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .put('/events/not-found')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /events/:id', () => {
    it('should delete an event', async () => {
      const response = await request(app.getHttpServer())
        .delete('/events/event-1')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: 'event-1' } });
      expect(response.body.id).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/events/event-1')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });
});
