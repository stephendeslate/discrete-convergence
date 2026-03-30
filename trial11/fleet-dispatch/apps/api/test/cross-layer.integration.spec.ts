import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: FD-CROSS-005
describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    driver: {
      findMany: jest.fn(),
    },
    dispatch: {
      findMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
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
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
  });

  describe('Full pipeline: auth → CRUD → error → correlation → timing → health', () => {
    it('should complete auth registration flow', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'cross@fleet.com',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'cross@fleet.com',
          password: 'password123',
          role: 'DISPATCHER',
          tenantId: 'tenant-1',
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('cross@fleet.com');
    });

    it('should enforce auth on protected endpoints', async () => {
      const res = await request(app.getHttpServer()).get('/vehicles');

      expect(res.status).toBe(401);
      expect(res.body.correlationId).toBeDefined();
    });

    it('should allow CRUD operations with valid token', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'cross@fleet.com',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });

      mockPrisma.vehicle.create.mockResolvedValue({
        id: 'v-1',
        name: 'Cross-Layer Truck',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cross-Layer Truck', licensePlate: 'XL-001' });

      expect(res.status).toBe(201);
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('should return sanitized errors without stack traces', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.stack).toBeUndefined();
      expect(res.body.statusCode).toBeDefined();
      expect(res.body.correlationId).toBeDefined();
    });

    it('should propagate correlation IDs through request chain', async () => {
      const correlationId = 'cross-layer-test-id';
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'cross@fleet.com',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });

      mockPrisma.vehicle.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', correlationId);

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBe(correlationId);
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include response time on health endpoint', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.version).toBeDefined();
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should verify DB connectivity via health/ready', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.database).toBe('connected');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should enforce RBAC across controllers', async () => {
      const driverToken = jwtService.sign({
        sub: 'user-3',
        email: 'driver@fleet.com',
        role: 'DRIVER',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .delete('/vehicles/v-1')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(403);
      expect(res.body.correlationId).toBeDefined();
    });

    it('should scope all CRUD by tenant', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'admin@fleet.com',
        role: 'ADMIN',
        tenantId: 'tenant-scoped',
      });

      mockPrisma.vehicle.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-scoped' },
        }),
      );
    });

    // TRACED: FD-CROSS-006
    it('should verify cumulative: metrics endpoint accessible', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.body.requestCount).toBeDefined();
      expect(res.body.averageResponseTime).toBeDefined();
    });
  });
});
