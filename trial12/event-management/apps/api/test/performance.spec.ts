import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-PERF-004
describe('Performance Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;
  let prisma: {
    event: { findMany: jest.Mock; count: jest.Mock };
    venue: { findMany: jest.Mock; count: jest.Mock };
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $on: jest.Mock;
    $queryRaw: jest.Mock;
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    prisma = {
      event: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      venue: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
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
    token = jwtService.sign({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      tenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response Time', () => {
    it('should include X-Response-Time header on events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });

    it('should include X-Response-Time header on health', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should default to page 1 with default page size', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
    });

    it('should clamp oversized page requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?pageSize=500')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.pageSize).toBe(100);
    });

    it('should handle custom page parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?page=2&pageSize=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
    });
  });

  describe('Cache Control', () => {
    it('should set Cache-Control on events list', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.headers['cache-control']).toBeDefined();
      expect(response.headers['cache-control']).toContain('private');
    });

    it('should set Cache-Control on venues list', async () => {
      const response = await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', `Bearer ${token}`);

      expect(response.headers['cache-control']).toBeDefined();
      expect(response.headers['cache-control']).toContain('private');
    });
  });
});
