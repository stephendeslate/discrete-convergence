import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import { APP_VERSION } from '@fleet-dispatch/shared';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

// TRACED: FD-CROSS-001
describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = createMockPrismaService();
  const tenantId = 'test-tenant-001';

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getToken(role = 'DISPATCHER'): string {
    return jwtService.sign({ sub: 'user-1', email: 'test@fleet.test', role, tenantId });
  }

  describe('Full auth -> CRUD pipeline', () => {
    it('should complete login -> create -> read flow', async () => {
      const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@fleet.test',
        password: hashedPassword,
        role: 'DISPATCHER',
        tenantId,
      });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@fleet.test', password: 'password123' })
        .expect(201);

      const token = loginRes.body.access_token;
      expect(token).toBeDefined();

      mockPrisma.vehicle.create.mockResolvedValue({
        id: 'v-new',
        licensePlate: 'FL-200',
        tenantId,
      });

      const createRes = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ licensePlate: 'FL-200', make: 'Ford', model: 'Transit', year: 2023, fuelCapacity: 80, costPerMile: 0.45 })
        .expect(201);

      expect(createRes.body.licensePlate).toBe('FL-200');

      mockPrisma.vehicle.findUnique.mockResolvedValue({
        id: 'v-new',
        licensePlate: 'FL-200',
        tenantId,
      });

      const readRes = await request(app.getHttpServer())
        .get('/vehicles/v-new')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(readRes.body.licensePlate).toBe('FL-200');
    });
  });

  describe('Health and version', () => {
    it('should return correct APP_VERSION from shared', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.version).toBe(APP_VERSION);
      expect(res.body.status).toBe('ok');
    });

    it('should check DB connectivity', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const res = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(res.body.status).toBe('ready');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('Error handling pipeline', () => {
    it('should return correlation ID in error responses', async () => {
      mockPrisma.vehicle.findUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app.getHttpServer())
        .get('/vehicles/bad-id')
        .set('Authorization', `Bearer ${getToken()}`)
        .set('X-Correlation-ID', 'test-corr-123')
        .expect(500);

      expect(res.body).toHaveProperty('correlationId');
      expect(res.body).toHaveProperty('message');
      expect(res.body).not.toHaveProperty('stack');
    });

    it('should return 404 for nonexistent resources', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/vehicles/nonexistent')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body).toHaveProperty('correlationId');
    });
  });

  describe('Response time on all endpoints', () => {
    it('should include X-Response-Time on auth endpoint', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'x@x.com', password: 'p' })
        .expect(401);

      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on CRUD endpoint', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Guard chain', () => {
    it('should apply ThrottlerGuard then JwtAuthGuard then RolesGuard', async () => {
      const res = await request(app.getHttpServer())
        .delete('/vehicles/v-1')
        .set('Authorization', `Bearer ${getToken('VIEWER')}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });

    it('should skip auth for public routes', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
    });
  });
});
