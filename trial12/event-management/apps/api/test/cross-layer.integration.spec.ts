import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-CROSS-002
describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prisma: {
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
    };
    user: { findFirst: jest.Mock; create: jest.Mock };
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $on: jest.Mock;
    $queryRaw: jest.Mock;
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Full pipeline test', () => {
    it('should handle auth flow → CRUD → error handling → correlation ID → response time → health', async () => {
      // Step 1: Auth - register attempt
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'pipeline@example.com',
        name: 'Pipeline User',
        role: 'USER',
      });

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'pipeline@example.com',
          password: 'password123',
          name: 'Pipeline User',
          role: 'USER',
          tenantId,
        });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.email).toBe('pipeline@example.com');

      // Step 2: Use JWT for authenticated requests
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'pipeline@example.com',
        role: 'USER',
        tenantId,
      });

      // Step 3: CRUD - read events
      const eventsRes = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', 'test-pipeline-123');

      expect(eventsRes.status).toBe(200);
      expect(eventsRes.headers['x-response-time']).toBeDefined();
      expect(eventsRes.headers['cache-control']).toBeDefined();

      // Step 4: Health check
      const healthRes = await request(app.getHttpServer()).get('/health');

      expect(healthRes.status).toBe(200);
      expect(healthRes.body.version).toBe(APP_VERSION);
      expect(healthRes.body.status).toBe('ok');

      // Step 5: DB connectivity check
      const readyRes = await request(app.getHttpServer()).get('/health/ready');

      expect(readyRes.status).toBe(200);
      expect(readyRes.body.database).toBe('connected');
    });

    it('should handle error paths with correlation ID in response', async () => {
      prisma.event.findFirst.mockResolvedValue(null);
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId,
      });

      const response = await request(app.getHttpServer())
        .get('/events/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', 'error-test-456');

      expect(response.status).toBe(404);
      expect(response.body.correlationId).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should reject unauthorized access across all protected routes', async () => {
      const routes = ['/events', '/venues', '/schedules', '/tickets', '/attendees'];

      for (const route of routes) {
        const response = await request(app.getHttpServer()).get(route);
        expect(response.status).toBe(401);
        expect(response.body).toBeDefined();
      }
    });
  });
});
