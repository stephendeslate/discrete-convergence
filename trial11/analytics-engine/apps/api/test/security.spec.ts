import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('Security Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    user: { findFirst: jest.fn(), create: jest.fn() },
    dashboard: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
    dataSource: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() },
    widget: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('JWT Authentication', () => {
    it('should reject missing authorization header', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject malformed Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'NotBearer token');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject expired token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 'u1', email: 'a@b.com', role: 'USER', tenantId: 't1' },
        { expiresIn: '0s' },
      );

      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('RBAC', () => {
    it('should deny USER from admin-only endpoint (delete dashboard)', async () => {
      const userToken = jwtService.sign({ sub: 'u1', email: 'user@test.com', role: 'USER', tenantId: 't1' });

      const res = await request(app.getHttpServer())
        .delete('/dashboards/d-1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.statusCode).toBe(403);
    });

    it('should deny VIEWER from admin-only endpoint (create data source)', async () => {
      const viewerToken = jwtService.sign({ sub: 'v1', email: 'viewer@test.com', role: 'VIEWER', tenantId: 't1' });

      const res = await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Source', type: 'pg', config: '{}' });

      expect(res.status).toBe(403);
      expect(res.body.statusCode).toBe(403);
    });

    it('should allow ADMIN access to admin-only endpoints', async () => {
      const adminToken = jwtService.sign({ sub: 'a1', email: 'admin@test.com', role: 'ADMIN', tenantId: 't1' });
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'd-1', tenantId: 't1', widgets: [] });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'd-1' });

      const res = await request(app.getHttpServer())
        .delete('/dashboards/d-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
      expect(mockPrisma.dashboard.delete).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 't1',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject overly long strings', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'a'.repeat(300) + '@test.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 't1',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should strip non-whitelisted properties', async () => {
      const token = jwtService.sign({ sub: 'u1', email: 'a@b.com', role: 'USER', tenantId: 't1' });
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', malicious: 'code' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Public routes', () => {
    it('should allow access to health without auth', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
      const res = await request(app.getHttpServer()).get('/monitoring/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should allow access to register without auth', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u-1', email: 'new@test.com', name: 'New', role: 'USER',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@test.com', password: 'pass123', name: 'New', role: 'USER', tenantId: 't1' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('new@test.com');
    });

    it('should allow access to login without auth', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'noone@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
