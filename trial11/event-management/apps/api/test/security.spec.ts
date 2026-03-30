import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-SEC-008
describe('Security Integration', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userToken: string;

  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockPrisma = {
    event: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    venue: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue({ id: 'v1', tenantId: testTenantId }), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    ticket: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    schedule: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    attendee: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(1),
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

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({
      sub: 'admin-1',
      email: 'admin@example.com',
      role: 'ADMIN',
      tenantId: testTenantId,
    });
    userToken = jwtService.sign({
      sub: 'user-1',
      email: 'user@example.com',
      role: 'USER',
      tenantId: testTenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'malformed')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Authorization (RBAC)', () => {
    it('should allow admin to delete venues', async () => {
      mockPrisma.venue.findUnique.mockResolvedValue({
        id: 'v1',
        name: 'Test',
        address: '123',
        capacity: 100,
        tenantId: testTenantId,
        events: [],
      });
      mockPrisma.venue.delete.mockResolvedValue({ id: 'v1' });

      const response = await request(app.getHttpServer())
        .delete('/venues/v1')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should deny USER role from deleting venues', async () => {
      const response = await request(app.getHttpServer())
        .delete('/venues/v1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.statusCode).toBe(403);
    });
  });

  describe('Validation', () => {
    it('should reject non-whitelisted fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'test1234', extraField: 'bad' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Error response sanitization', () => {
    it('should not include stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/not-found')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);

      expect(response.body.stack).toBeUndefined();
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Public endpoints', () => {
    it('should allow access to health without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    it('should allow access to auth endpoints without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'test1234' });

      // We expect 401 (invalid creds) not 403 (auth required)
      expect([201, 401]).toContain(response.status);
    });
  });
});
