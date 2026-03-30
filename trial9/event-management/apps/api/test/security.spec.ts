import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import type { Server } from 'http';

describe('Security Integration', () => {
  let app: INestApplication;
  let server: Server;
  let jwtService: JwtService;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    user: { findFirst: jest.fn(), create: jest.fn() },
    event: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    venue: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    ticket: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    attendee: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), count: jest.fn() },
    schedule: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
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
    server = app.getHttpServer() as Server;
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should return 401 for requests without token', async () => {
      const response = await request(server).get('/events');
      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(server)
        .get('/events')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should return 401 for expired token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 'user-1', email: 'test@example.com', role: 'USER', tenantId: 'tenant-1' },
        { expiresIn: '0s' },
      );

      // Small delay to ensure token is expired
      await new Promise((r) => setTimeout(r, 100));

      const response = await request(server)
        .get('/events')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Authorization (RBAC)', () => {
    it('should allow admin to delete tickets', async () => {
      const adminToken = jwtService.sign({
        sub: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        tenantId: 'tenant-1',
        event: { id: 'event-1' },
      });
      mockPrisma.ticket.delete.mockResolvedValue({ id: 'ticket-1' });

      const response = await request(server)
        .delete('/tickets/ticket-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('ticket-1');
    });

    it('should deny non-admin ticket deletion', async () => {
      const userToken = jwtService.sign({
        sub: 'user-1',
        email: 'user@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const response = await request(server)
        .delete('/tickets/ticket-1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should reject extra fields', async () => {
      const response = await request(server)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-1',
          maliciousField: 'attack',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should reject invalid role values', async () => {
      const response = await request(server)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          role: 'SUPERADMIN',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Error Response', () => {
    it('should not leak stack traces in error responses', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const response = await request(server)
        .get('/events/non-existent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.stack).toBeUndefined();
      expect(response.body.correlationId).toBeDefined();
    });
  });

  describe('Public Routes', () => {
    it('should allow health endpoint without auth', async () => {
      const response = await request(server).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should allow metrics endpoint without auth', async () => {
      const response = await request(server).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.body.requestCount).toBeDefined();
    });
  });
});
