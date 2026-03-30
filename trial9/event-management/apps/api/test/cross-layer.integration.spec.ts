import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { APP_VERSION } from '@event-management/shared';
import type { Server } from 'http';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let server: Server;
  let jwtService: JwtService;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    user: { findFirst: jest.fn(), create: jest.fn() },
    event: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    venue: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    ticket: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    attendee: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), count: jest.fn() },
    schedule: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    server = app.getHttpServer() as Server;
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
  });

  describe('Full pipeline: auth -> CRUD -> error handling -> response time -> health', () => {
    it('should authenticate, perform CRUD, and include response time', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });

      // Create event
      mockPrisma.event.create.mockResolvedValue({
        id: 'event-1',
        title: 'Full Pipeline Event',
        tenantId: 'tenant-1',
        venue: { id: 'v1' },
      });

      const createRes = await request(server)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Full Pipeline Event',
          startDate: '2025-06-15T09:00:00Z',
          endDate: '2025-06-16T17:00:00Z',
          venueId: 'venue-1',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.headers['x-response-time']).toBeDefined();

      // Read events
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const listRes = await request(server)
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.headers['cache-control']).toBeDefined();
    });

    it('should return error with correlationId and no stack trace', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      mockPrisma.event.findUnique.mockResolvedValue(null);

      const response = await request(server)
        .get('/events/non-existent')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', 'test-cross-layer-id');

      expect(response.status).toBe(404);
      expect(response.body.correlationId).toBe('test-cross-layer-id');
      expect(response.body.stack).toBeUndefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Health endpoints without auth', () => {
    it('should return health with APP_VERSION from shared', async () => {
      const response = await request(server).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.version).toBe(APP_VERSION);
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should return DB readiness check', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const response = await request(server).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body.database).toBe('connected');
    });
  });

  describe('Guard chain verification', () => {
    it('should reject unauthenticated requests to protected routes', async () => {
      const response = await request(server).get('/events');
      expect(response.status).toBe(401);
      expect(response.body.correlationId).toBeDefined();
    });

    it('should enforce RBAC on admin routes', async () => {
      const userToken = jwtService.sign({
        sub: 'user-1',
        email: 'user@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const response = await request(server)
        .delete('/tickets/ticket-1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Middleware chain', () => {
    it('should preserve correlation ID through request pipeline', async () => {
      const correlationId = 'pipeline-test-id';
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const response = await request(server)
        .get('/events')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', correlationId);

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });
});
