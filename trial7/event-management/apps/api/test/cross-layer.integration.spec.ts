import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { APP_VERSION } from '@event-management/shared';
import { createTestToken, TEST_TENANT_ID, TEST_USER_ID } from './helpers/test-utils';

describe('Cross-Layer Integration (E2E)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;

  const mockPrisma = {
    event: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findFirst: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(0),
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

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userToken = createTestToken(jwtService, {
      sub: TEST_USER_ID,
      email: 'user@test.com',
      role: 'USER',
      tenantId: TEST_TENANT_ID,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Full pipeline verification', () => {
    it('should enforce auth on protected routes', async () => {
      const response = await request(app.getHttpServer()).get('/events');
      expect(response.status).toBe(401);
    });

    it('should allow auth + CRUD flow', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
    });

    it('should include X-Response-Time on all responses', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should return correct health data with shared APP_VERSION', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.status).toBe('ok');
    });

    it('should verify DB connectivity', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');
      expect(response.body.database).toBe('connected');
    });

    it('should handle errors with correlationId', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .get('/events/nonexistent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-Correlation-ID', 'test-corr-123');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('correlationId');
    });

    it('should preserve correlation ID from client', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .get('/events/nonexistent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-Correlation-ID', 'custom-correlation-id');
      expect(response.body.correlationId).toBe('custom-correlation-id');
    });
  });
});
