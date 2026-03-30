import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken, TEST_TENANT_ID, TEST_USER_ID } from './helpers/test-utils';

describe('Event Integration (E2E)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let adminToken: string;

  const mockPrisma = {
    event: {
      create: jest.fn().mockResolvedValue({
        id: 'event-1',
        title: 'Test Event',
        tenantId: TEST_TENANT_ID,
      }),
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

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userToken = createTestToken(jwtService, {
      sub: TEST_USER_ID,
      email: 'user@test.com',
      role: 'USER',
      tenantId: TEST_TENANT_ID,
    });
    adminToken = createTestToken(jwtService, {
      sub: 'admin-1',
      email: 'admin@test.com',
      role: 'ADMIN',
      tenantId: TEST_TENANT_ID,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /events', () => {
    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer()).get('/events');
      expect(response.status).toBe(401);
    });

    it('should return paginated events with valid token', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('POST /events', () => {
    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({ title: 'Test' });
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid event data', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe('GET /events/:id', () => {
    it('should return 404 for non-existent event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .get('/events/nonexistent-id')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /events/:id', () => {
    it('should return 403 for USER role', async () => {
      const response = await request(app.getHttpServer())
        .delete('/events/event-1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(403);
    });

    it('should allow ADMIN to delete', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({
        id: 'event-1',
        tenantId: TEST_TENANT_ID,
      });
      mockPrisma.event.delete.mockResolvedValue({
        id: 'event-1',
      });
      const response = await request(app.getHttpServer())
        .delete('/events/event-1')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });
  });

  describe('GET /events/stats/summary', () => {
    it('should return 403 for non-admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/stats/summary')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(403);
    });
  });
});
