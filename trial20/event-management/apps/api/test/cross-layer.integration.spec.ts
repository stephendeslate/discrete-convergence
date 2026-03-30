import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { APP_VERSION } from '@event-management/shared';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    event: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
      delete: jest.fn(),
    },
    venue: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    attendee: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    registration: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
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

  it('should have APP_VERSION in health response matching shared constant', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.version).toBe(APP_VERSION);
  });

  it('full pipeline: auth -> CRUD -> error handling -> correlation ID -> response time', async () => {
    // Step 1: Health check
    const healthRes = await request(app.getHttpServer()).get('/health');
    expect(healthRes.status).toBe(200);
    expect(healthRes.headers['x-response-time']).toBeDefined();
    expect(healthRes.headers['x-correlation-id']).toBeDefined();

    // Step 2: Protected endpoint without auth
    const noAuthRes = await request(app.getHttpServer()).get('/events');
    expect(noAuthRes.status).toBe(401);

    // Step 3: Authenticated CRUD
    const eventsRes = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${token}`);
    expect(eventsRes.status).toBe(200);
    expect(eventsRes.headers['x-response-time']).toBeDefined();
    expect(eventsRes.headers['x-correlation-id']).toBeDefined();
    expect(eventsRes.headers['cache-control']).toBeDefined();

    // Step 4: Error handling - not found
    mockPrisma.event.findUnique.mockResolvedValue(null);
    const notFoundRes = await request(app.getHttpServer())
      .get('/events/nonexistent')
      .set('Authorization', `Bearer ${token}`);
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.headers['x-correlation-id']).toBeDefined();
  });

  it('should propagate correlation ID through the full request chain', async () => {
    const correlationId = 'test-cross-layer-corr-id';
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Correlation-ID', correlationId);

    expect(res.headers['x-correlation-id']).toBe(correlationId);
  });

  it('should verify DB connectivity through health/ready', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.database).toBe('connected');
  });

  it('should block viewer from admin-only operations', async () => {
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
        title: 'Blocked Event',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-06-01T12:00:00Z',
        maxAttendees: 100,
        ticketPrice: 25,
        venueId: 'v-1',
      });

    expect(res.status).toBe(403);
  });

  it('should handle error path with correlationId in response', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .get('/events/nonexistent')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Correlation-ID', 'error-corr');

    expect(res.status).toBe(404);
    expect(res.body.correlationId).toBe('error-corr');
  });
});
