import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-CROSS-001
describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtToken: string;
  let expiredToken: string;

  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockPrisma = {
    event: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
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
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
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
    expiredToken = jwtService.sign(
      { sub: 'user-1', email: 'test@example.com', role: 'USER', tenantId: testTenantId },
      { expiresIn: '0s' },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth → CRUD pipeline', () => {
    it('should allow authenticated CRUD operations', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should reject expired tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Error handling → Correlation IDs', () => {
    it('should include correlation ID in error responses', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/events/not-found')
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('X-Correlation-ID', 'test-correlation-123')
        .expect(404);

      expect(response.body.correlationId).toBe('test-correlation-123');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('Response time headers', () => {
    it('should include X-Response-Time header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });
  });

  describe('Health endpoint', () => {
    it('should return health status with version', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.uptime).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return readiness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.database).toBe('connected');
    });
  });

  describe('Metrics endpoint', () => {
    it('should return metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(response.body.requestCount).toBeDefined();
      expect(response.body.errorCount).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('Global exception filter sanitization', () => {
    it('should not leak stack traces', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/not-found')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);

      expect(response.body.stack).toBeUndefined();
      expect(response.body.statusCode).toBe(404);
    });
  });
});
