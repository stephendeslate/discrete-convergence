import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { EventController } from '../src/event/event.controller';
import { EventService } from '../src/event/event.service';
import { Reflector } from '@nestjs/core';

const mockUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'org1' };

const mockEventService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  publish: jest.fn(),
  cancel: jest.fn(),
};

describe('EventController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: mockEventService },
        Reflector,
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    // Inject mock user
    app.use((req: Record<string, unknown>, _res: unknown, next: () => void) => {
      req['user'] = mockUser;
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('POST /events should create an event', async () => {
    mockEventService.create.mockResolvedValue({ id: 'e1', title: 'New Event' });
    const res = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'New Event', slug: 'new-event', timezone: 'UTC',
        startDate: '2025-06-01T10:00:00Z', endDate: '2025-06-01T18:00:00Z',
      })
      .expect(201);
    expect(res.body.title).toBe('New Event');
  });

  it('POST /events should reject missing title', async () => {
    await request(app.getHttpServer())
      .post('/events')
      .send({ slug: 'no-title', timezone: 'UTC', startDate: '2025-06-01T10:00:00Z', endDate: '2025-06-01T18:00:00Z' })
      .expect(400);
  });

  it('GET /events should return paginated events', async () => {
    mockEventService.findAll.mockResolvedValue({ data: [], total: 0 });
    const res = await request(app.getHttpServer()).get('/events').expect(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.total).toBeDefined();
  });

  it('GET /events/:id should return single event', async () => {
    mockEventService.findOne.mockResolvedValue({ id: 'e1', title: 'Found' });
    const res = await request(app.getHttpServer()).get('/events/e1').expect(200);
    expect(res.body.title).toBe('Found');
  });

  it('POST /events/:id/publish should publish event', async () => {
    mockEventService.publish.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
    const res = await request(app.getHttpServer()).post('/events/e1/publish').expect(201);
    expect(res.body.status).toBe('PUBLISHED');
  });

  it('POST /events/:id/cancel should cancel event', async () => {
    mockEventService.cancel.mockResolvedValue({ id: 'e1', status: 'CANCELLED' });
    const res = await request(app.getHttpServer()).post('/events/e1/cancel').expect(201);
    expect(res.body.status).toBe('CANCELLED');
  });
});
