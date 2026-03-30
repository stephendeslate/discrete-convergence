import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  const mockDashboard = {
    id: 'dash-1',
    name: 'Test Dashboard',
    description: 'Test desc',
    status: 'DRAFT',
    tenantId: 'tenant-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [],
  };

  const mockPrisma = {
    dashboard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    widget: { findMany: jest.fn(), count: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn() },
    queryExecution: { findMany: jest.fn(), count: jest.fn() },
    user: { findFirst: jest.fn() },
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
      email: 'test@example.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a dashboard', async () => {
    mockPrisma.dashboard.create.mockResolvedValue(mockDashboard);

    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Dashboard', description: 'Test desc' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Dashboard');
  });

  it('should get all dashboards with pagination', async () => {
    mockPrisma.dashboard.findMany.mockResolvedValue([mockDashboard]);
    mockPrisma.dashboard.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.headers['cache-control']).toBeDefined();
  });

  it('should get a dashboard by id', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);

    const res = await request(app.getHttpServer())
      .get('/dashboards/dash-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('dash-1');
  });

  it('should update a dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
    mockPrisma.dashboard.update.mockResolvedValue({
      ...mockDashboard,
      name: 'Updated',
    });

    const res = await request(app.getHttpServer())
      .put('/dashboards/dash-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
    mockPrisma.dashboard.delete.mockResolvedValue(mockDashboard);

    const res = await request(app.getHttpServer())
      .delete('/dashboards/dash-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
  });

  it('should return 404 for non-existent dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .get('/dashboards/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');

    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should reject invalid dashboard data', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ invalidField: 'data' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it('should return 404 for wrong tenant dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue({
      ...mockDashboard,
      tenantId: 'other-tenant',
    });

    const res = await request(app.getHttpServer())
      .get('/dashboards/dash-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });
});
