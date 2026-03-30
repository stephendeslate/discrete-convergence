import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { NoopThrottlerGuard } from './helpers/test-utils';

// TRACED: AE-SEC-007
describe('Security Integration Tests', () => {
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
          findUnique: jest.fn(),
          create: jest.fn(),
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

  describe('Authentication enforcement', () => {
    it('should reject unauthenticated requests to protected endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });

    it('should reject requests with malformed tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer malformed-token');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });

    it('should allow authenticated requests', async () => {
      const token = await jwtService.signAsync({
        sub: userId,
        email: 'test@test.com',
        role: 'USER',
        tenantId,
      });

      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('RBAC enforcement', () => {
    it('should deny non-admin users from admin endpoints', async () => {
      const token = await jwtService.signAsync({
        sub: userId,
        email: 'user@test.com',
        role: 'USER',
        tenantId,
      });

      const response = await request(app.getHttpServer())
        .delete('/dashboards/some-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.statusCode).toBe(403);
    });

    it('should allow admin users to access admin endpoints', async () => {
      const adminToken = await jwtService.signAsync({
        sub: userId,
        email: 'admin@test.com',
        role: 'ADMIN',
        tenantId,
      });

      const response = await request(app.getHttpServer())
        .get('/dashboards/stats/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('Validation enforcement', () => {
    it('should reject requests with unexpected fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
          hackField: 'evil',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject SQL injection attempts in body', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "' OR 1=1 --",
          password: "' OR 1=1 --",
        });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('Public endpoints', () => {
    it('should allow access to health endpoint without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should allow access to health/ready without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });

    it('should allow access to metrics without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requestCount');
    });
  });

  describe('Error sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route');

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).toHaveProperty('statusCode');
    });

    it('should include correlation ID in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards');

      expect(response.body).toHaveProperty('correlationId');
      expect(typeof response.body.correlationId).toBe('string');
    });
  });
});
