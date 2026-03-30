import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

// TRACED: FD-SEC-008
describe('Security Integration', () => {
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

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should reject expired tokens', async () => {
      const token = jwtService.sign(
        { sub: 'user-1', email: 'test@fleet.test', role: 'DRIVER', tenantId },
        { expiresIn: '0s' },
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('Authorization', () => {
    it('should reject non-admin from admin endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/admin/users')
        .set('Authorization', `Bearer ${getToken('DRIVER')}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });

    it('should allow admin to admin endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/admin/users')
        .set('Authorization', `Bearer ${getToken('ADMIN')}`)
        .expect(200);

      expect(res.body.message).toBe('Admin access granted');
    });

    it('should reject non-admin from delete endpoints', async () => {
      const res = await request(app.getHttpServer())
        .delete('/vehicles/some-id')
        .set('Authorization', `Bearer ${getToken('VIEWER')}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });
  });

  describe('Validation', () => {
    it('should reject registration with forbidden fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@fleet.test',
          password: 'password123',
          name: 'Test',
          role: 'DRIVER',
          tenantId,
          isAdmin: true,
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should reject empty email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: '', password: 'password123' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@fleet.test' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('Public endpoints', () => {
    it('should allow health without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
    });

    it('should allow metrics without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(res.body).toHaveProperty('requestCount');
    });

    it('should allow login without auth', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@fleet.test', password: 'pass' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('Error sanitization', () => {
    it('should not leak stack traces in error responses', async () => {
      mockPrisma.vehicle.findUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app.getHttpServer())
        .get('/vehicles/v-1')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(500);

      expect(res.body).not.toHaveProperty('stack');
      expect(res.body).toHaveProperty('correlationId');
      expect(res.body).toHaveProperty('message');
    });
  });
});
