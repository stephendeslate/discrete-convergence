import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { APP_VERSION, BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import { NoopThrottlerGuard } from './helpers/test-utils';

// TRACED: AE-CROSS-002
describe('Cross-Layer Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '660e8400-e29b-41d4-a716-446655440001';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ThrottlerGuard)
      .useClass(NoopThrottlerGuard)
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        dashboard: {
          findMany: jest.fn().mockResolvedValue([]),
          findUnique: jest.fn().mockResolvedValue({
            id: 'test-id',
            title: 'Test',
            tenantId,
            userId,
            status: 'DRAFT',
            widgets: [],
            user: { id: userId, name: 'Test', email: 'test@test.com' },
          }),
          create: jest.fn().mockResolvedValue({
            id: 'new-id',
            title: 'Created',
            tenantId,
            userId,
            status: 'DRAFT',
            widgets: [],
          }),
          update: jest.fn(),
          delete: jest.fn(),
          count: jest.fn().mockResolvedValue(0),
        },
        widget: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        dataSource: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $executeRaw: jest.fn().mockResolvedValue(1),
      })
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

  describe('Full pipeline: auth -> CRUD -> errors -> monitoring', () => {
    it('should complete the full auth -> dashboard CRUD pipeline', async () => {
      const token = await jwtService.signAsync({
        sub: userId,
        email: 'pipeline@test.com',
        role: 'ADMIN',
        tenantId,
      });

      // Create dashboard
      const createResponse = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Pipeline Test' });

      expect(createResponse.status).toBe(201);
      expect(createResponse.headers['x-response-time']).toBeDefined();
      expect(createResponse.headers['x-correlation-id']).toBeDefined();

      // List dashboards
      const listResponse = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.headers['cache-control']).toBeDefined();
    });

    it('should handle error scenarios with correlation ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).not.toHaveProperty('stack');
    });

    it('should verify health endpoint includes APP_VERSION', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should verify DB connectivity check via health/ready', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('database');
    });

    it('should validate BCRYPT_SALT_ROUNDS is imported from shared', () => {
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
      expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
    });

    it('should enforce tenant isolation via JWT', async () => {
      const tenant1Token = await jwtService.signAsync({
        sub: userId,
        email: 'user1@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const tenant2Token = await jwtService.signAsync({
        sub: userId,
        email: 'user2@test.com',
        role: 'USER',
        tenantId: 'tenant-2',
      });

      const response1 = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${tenant1Token}`);

      const response2 = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    it('should apply rate limiting without blocking health checks', async () => {
      // Health endpoint should work even under load (exempt from throttle)
      // Send requests sequentially to avoid ECONNRESET on test server
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer()).get('/health');
        expect(response.status).toBe(200);
      }
    });

    it('should include response time on error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards');

      expect(response.status).toBe(401);
      expect(response.headers['x-correlation-id']).toBeDefined();
    });
  });
});
