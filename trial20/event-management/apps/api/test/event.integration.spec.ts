import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Event Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  const mockPrisma = {
    user: { findFirst: jest.fn(), create: jest.fn() },
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    venue: { findMany: jest.fn(), count: jest.fn() },
    attendee: { findMany: jest.fn(), count: jest.fn() },
    registration: { findMany: jest.fn(), count: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $on: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    jwtService = moduleFixture.get(JwtService);
    token = jwtService.sign({
      sub: 'user-1',
      email: 'admin@test.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should create an event with valid token', async () => {
    mockPrisma.event.create.mockResolvedValue({
      id: 'e-1',
      title: 'Test Event',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Event',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-06-01T12:00:00Z',
        maxAttendees: 100,
        ticketPrice: 25.00,
        venueId: 'v-1',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('should list events with pagination', async () => {
    mockPrisma.event.findMany.mockResolvedValue([{ id: 'e-1' }]);
    mockPrisma.event.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer())
      .get('/events?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.headers['cache-control']).toBeDefined();
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app.getHttpServer()).get('/events');

    expect(res.status).toBe(401);
  });

  it('should reject event creation with missing required fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Incomplete' });

    expect(res.status).toBe(400);
  });

  it('should get a single event by id', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: 'e-1', tenantId: 'tenant-1' });

    const res = await request(app.getHttpServer())
      .get('/events/e-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should return 404 for non-existent event', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .get('/events/missing')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should deny viewer from creating events', async () => {
    const viewerToken = jwtService.sign({
      sub: 'user-2',
      email: 'viewer@test.com',
      role: 'VIEWER',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        title: 'Test',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-06-01T12:00:00Z',
        maxAttendees: 100,
        ticketPrice: 25,
        venueId: 'v-1',
      });

    expect(res.status).toBe(403);
  });
});
