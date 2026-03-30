import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken, TEST_TENANT_ID, TEST_USER_ID } from './helpers/test-utils';

describe('Performance Integration (E2E)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;

  const mockPrisma = {
    event: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    venue: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    ticket: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    category: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
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

  describe('X-Response-Time header', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers).toHaveProperty('x-response-time');
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should include X-Response-Time on events list', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.headers).toHaveProperty('x-response-time');
    });
  });

  describe('Cache-Control headers', () => {
    it('should include Cache-Control on events list', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers['cache-control']).toContain('max-age');
    });

    it('should include Cache-Control on venues list', async () => {
      const response = await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.headers).toHaveProperty('cache-control');
    });
  });

  describe('Pagination', () => {
    it('should return paginated response with defaults', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('pageSize', 20);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?pageSize=999')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.body.pageSize).toBeLessThanOrEqual(100);
    });
  });
});
