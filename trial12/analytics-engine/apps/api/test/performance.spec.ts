import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Performance Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    dashboard: {
      findMany: jest.fn().mockResolvedValue([]),
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
    queryExecution: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

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
    jwtService = moduleFixture.get(JwtService);
    token = jwtService.sign({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include X-Response-Time header', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
  });

  it('should include Cache-Control on dashboard list', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('max-age');
  });

  it('should include Cache-Control on widget list', async () => {
    const res = await request(app.getHttpServer())
      .get('/widgets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('max-age');
  });

  it('should include Cache-Control on data-source list', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('max-age');
  });

  it('should return paginated results', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.total).toBeDefined();
    expect(res.body.pageSize).toBeDefined();
  });

  it('should clamp page size to MAX_PAGE_SIZE', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards?page=1&limit=500')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.pageSize).toBeLessThanOrEqual(100);
  });
});
