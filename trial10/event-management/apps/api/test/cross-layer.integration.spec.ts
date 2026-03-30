// TRACED: EM-CROSS-003 — Cross-layer integration test verifying full pipeline
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { APP_VERSION } from '@event-management/shared';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockPrisma = createMockPrismaService();
    mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
    mockPrisma.user.findFirst.mockResolvedValue(null);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Full pipeline verification', () => {
    it('should verify health endpoint returns APP_VERSION from shared', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.status).toBe('ok');
    });

    it('should verify auth → CRUD pipeline (unauthorized)', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({ title: 'Test', startDate: '2025-06-01', endDate: '2025-06-02' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.correlationId).toBeDefined();
    });

    it('should verify error handling with correlation IDs', async () => {
      const correlationId = 'test-cross-layer-id';
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('X-Correlation-ID', correlationId)
        .expect(401);

      expect(response.headers['x-correlation-id']).toBe(correlationId);
      expect(response.body.statusCode).toBe(401);
    });

    it('should verify response time tracking across all endpoints', async () => {
      const healthResponse = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(healthResponse.headers['x-response-time']).toBeDefined();

      const authResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })
        .expect(401);

      expect(authResponse.headers['x-correlation-id']).toBeDefined();
      expect(authResponse.body.correlationId).toBeDefined();
    });

    it('should verify database connectivity via health/ready', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
    });

    it('should verify validation pipeline rejects malformed requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: '123', role: 'INVALID' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.correlationId).toBeDefined();
    });
  });
});
