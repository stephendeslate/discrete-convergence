import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PrismaService } from '../src/infra/prisma.service';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;
  const tenantId = 'tenant-1';

  const mockPrisma = {
    user: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    dashboard: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    dataSource: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    jwtService = moduleRef.get(JwtService);
    token = jwtService.sign({ sub: 'user-1', email: 'test@example.com', role: 'ADMIN', tenantId });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list dashboards with authentication', async () => {
    mockPrisma.dashboard.findMany.mockResolvedValue([]);
    mockPrisma.dashboard.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('should create a dashboard', async () => {
    mockPrisma.dashboard.create.mockResolvedValue({
      id: 'd-1', name: 'New Dashboard', status: 'DRAFT', tenantId,
    });

    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Dashboard' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Dashboard');
  });

  it('should reject dashboard creation without name', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 for nonexistent dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .get('/dashboards/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return Cache-Control header on list endpoint', async () => {
    mockPrisma.dashboard.findMany.mockResolvedValue([]);
    mockPrisma.dashboard.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('should delete a dashboard as admin', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue({
      id: 'd-1', tenantId, widgets: [],
    });
    mockPrisma.dashboard.delete.mockResolvedValue({ id: 'd-1' });

    const res = await request(app.getHttpServer())
      .delete('/dashboards/d-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should deny delete for non-admin users', async () => {
    const viewerToken = jwtService.sign({ sub: 'user-2', email: 'viewer@example.com', role: 'VIEWER', tenantId });

    const res = await request(app.getHttpServer())
      .delete('/dashboards/d-1')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });
});
