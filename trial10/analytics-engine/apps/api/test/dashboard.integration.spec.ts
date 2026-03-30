import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { NoopThrottlerGuard } from './helpers/test-utils';

// TRACED: AE-DASH-003
describe('Dashboard Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '660e8400-e29b-41d4-a716-446655440001';

  const mockDashboard = {
    id: '770e8400-e29b-41d4-a716-446655440002',
    title: 'Test Dashboard',
    description: 'A test dashboard',
    status: 'DRAFT',
    tenantId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [],
    user: { id: userId, name: 'Test', email: 'test@test.com' },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ThrottlerGuard)
      .useClass(NoopThrottlerGuard)
      .overrideProvider(PrismaService)
      .useValue({
        dashboard: {
          create: jest.fn().mockResolvedValue(mockDashboard),
          findMany: jest.fn().mockResolvedValue([mockDashboard]),
          findUnique: jest.fn().mockResolvedValue(mockDashboard),
          update: jest.fn().mockResolvedValue({ ...mockDashboard, title: 'Updated' }),
          delete: jest.fn().mockResolvedValue(mockDashboard),
          count: jest.fn().mockResolvedValue(1),
        },
        user: {
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
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

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    authToken = await jwtService.signAsync({
      sub: userId,
      email: 'test@test.com',
      role: 'USER',
      tenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /dashboards', () => {
    it('should create a dashboard successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Dashboard', description: 'A test' });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Dashboard');
    });

    it('should reject creation without auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ title: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });

    it('should reject creation with missing title', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
      expect(response.body.statusCode).toBe(400);
    });

    it('should reject creation with invalid status', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test', status: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /dashboards', () => {
    it('should return paginated dashboards', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.headers['cache-control']).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards?page=1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
    });

    it('should reject without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards');

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should return a specific dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get(`/dashboards/${mockDashboard.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mockDashboard.id);
    });

    it('should return 404 for non-existent dashboard', async () => {
      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app.getHttpServer())
        .get('/dashboards/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for dashboard from different tenant', async () => {
      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDashboard,
        tenantId: 'different-tenant',
      });

      const response = await request(app.getHttpServer())
        .get(`/dashboards/${mockDashboard.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /dashboards/:id', () => {
    it('should update a dashboard', async () => {
      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce(mockDashboard);

      const response = await request(app.getHttpServer())
        .put(`/dashboards/${mockDashboard.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBeDefined();
    });

    it('should reject update without auth', async () => {
      const response = await request(app.getHttpServer())
        .put(`/dashboards/${mockDashboard.id}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should reject delete for non-ADMIN users', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/dashboards/${mockDashboard.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.statusCode).toBe(403);
    });

    it('should allow delete for ADMIN users', async () => {
      const adminToken = await jwtService.signAsync({
        sub: userId,
        email: 'admin@test.com',
        role: 'ADMIN',
        tenantId,
      });

      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce(mockDashboard);

      const response = await request(app.getHttpServer())
        .delete(`/dashboards/${mockDashboard.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(prisma.dashboard.delete).toHaveBeenCalled();
    });

    it('should reject delete without auth', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/dashboards/${mockDashboard.id}`);

      expect(response.status).toBe(401);
      expect(response.body.statusCode).toBe(401);
    });
  });
});
