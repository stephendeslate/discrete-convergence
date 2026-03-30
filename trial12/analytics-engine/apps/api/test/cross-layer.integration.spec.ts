import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { APP_VERSION, BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockPrisma.dashboard.findMany.mockResolvedValue([]);
    mockPrisma.dashboard.count.mockResolvedValue(0);
  });

  it('should complete full auth → CRUD pipeline', async () => {
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      name: 'Test',
      password: hashed,
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(loginRes.status).toBe(201);
    const token = loginRes.body.access_token;

    mockPrisma.dashboard.create.mockResolvedValue({
      id: 'dash-1',
      name: 'Test',
      tenantId: 'tenant-1',
      userId: 'user-1',
      widgets: [],
    });

    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test' });

    expect(createRes.status).toBe(201);
    expect(createRes.headers['x-response-time']).toBeDefined();
  });

  it('should enforce auth guard on protected endpoints', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');

    expect(res.status).toBe(401);
    expect(res.body.correlationId).toBeDefined();
  });

  it('should enforce role-based access', async () => {
    const viewerToken = jwtService.sign({
      sub: 'user-2',
      email: 'viewer@test.com',
      role: 'VIEWER',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .delete('/dashboards/dash-1')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.statusCode).toBe(403);
  });

  it('should include correlation ID in error responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('X-Correlation-ID', 'corr-123');

    expect(res.body.correlationId).toBe('corr-123');
    expect(res.status).toBe(401);
  });

  it('should return health with version from shared', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.version).toBe(APP_VERSION);
    expect(res.body.uptime).toBeDefined();
  });

  it('should verify database connectivity', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.database).toBe('connected');
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });

  it('should include response time on all endpoints', async () => {
    const token = jwtService.sign({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.status).toBe(200);
  });

  it('should handle error paths with sanitized output', async () => {
    const token = jwtService.sign({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });

    mockPrisma.dashboard.findMany.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.stack).toBeUndefined();
    expect(res.body.timestamp).toBeDefined();
  });
});
