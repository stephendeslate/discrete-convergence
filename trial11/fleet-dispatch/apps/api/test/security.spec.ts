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
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    driver: {
      findFirst: jest.fn(),
      delete: jest.fn(),
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

  describe('Authentication Guard', () => {
    it('should reject requests without token', async () => {
      const res = await request(app.getHttpServer()).get('/vehicles');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject invalid JWT token', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should reject expired JWT token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 'user-1', email: 'test@fleet.com', role: 'ADMIN', tenantId: 'tenant-1' },
        { expiresIn: '0s' },
      );
      // Wait just a moment for it to be expired
      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should allow public endpoints without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('RBAC', () => {
    it('should return 403 for non-admin on admin-only endpoints', async () => {
      const driverToken = jwtService.sign({
        sub: 'user-2',
        email: 'driver@fleet.com',
        role: 'DRIVER',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .delete('/vehicles/v-1')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(403);
      expect(res.body.statusCode).toBe(403);
    });

    it('should return 403 for dispatcher on admin-only driver delete', async () => {
      const dispatcherToken = jwtService.sign({
        sub: 'user-3',
        email: 'dispatch@fleet.com',
        role: 'DISPATCHER',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .delete('/drivers/d-1')
        .set('Authorization', `Bearer ${dispatcherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.statusCode).toBe(403);
    });
  });

  describe('Input Validation', () => {
    it('should reject requests with extra properties', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'admin@fleet.com',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Truck', licensePlate: 'ABC', evilProp: 'injected' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject empty body on create', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'admin@fleet.com',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Error Sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      const res = await request(app.getHttpServer()).get('/vehicles');

      expect(res.status).toBe(401);
      expect(res.body.stack).toBeUndefined();
      expect(res.body.statusCode).toBeDefined();
    });

    it('should include correlationId in error responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('X-Correlation-ID', 'test-correlation-123');

      expect(res.status).toBe(401);
      expect(res.body.correlationId).toBeDefined();
    });
  });
});
