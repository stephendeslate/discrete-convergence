import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import helmet from 'helmet';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-SEC-005
describe('Security Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prisma: {
    event: { findMany: jest.Mock; findFirst: jest.Mock; delete: jest.Mock; count: jest.Mock };
    venue: { findFirst: jest.Mock; delete: jest.Mock };
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $on: jest.Mock;
    $queryRaw: jest.Mock;
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    prisma = {
      event: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      venue: {
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"] } } }));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Helmet security headers', () => {
    it('should set content-security-policy header', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should set x-frame-options header', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Authentication guards', () => {
    it('should reject unauthenticated requests to protected routes', async () => {
      const response = await request(app.getHttpServer()).get('/events');

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwtService.sign(
        { sub: 'user-1', email: 'test@example.com', role: 'USER', tenantId },
        { expiresIn: '0s' },
      );

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should reject malformed tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer not.a.valid.jwt.token');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('RBAC', () => {
    it('should allow ADMIN to delete venues', async () => {
      const adminToken = jwtService.sign({
        sub: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
        tenantId,
      });
      prisma.venue.findFirst.mockResolvedValue({
        id: 'venue-1',
        name: 'Venue',
        tenantId,
        events: [],
      });
      prisma.venue.delete.mockResolvedValue({ id: 'venue-1' });

      const response = await request(app.getHttpServer())
        .delete('/venues/venue-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should deny USER from deleting venues', async () => {
      const userToken = jwtService.sign({
        sub: 'user-1',
        email: 'user@example.com',
        role: 'USER',
        tenantId,
      });

      const response = await request(app.getHttpServer())
        .delete('/venues/venue-1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should strip unknown properties', async () => {
      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId,
      });

      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test',
          description: 'Desc',
          startDate: '2026-06-15T09:00:00Z',
          endDate: '2026-06-16T17:00:00Z',
          capacity: 100,
          venueId: 'venue-1',
          unknownField: 'should be rejected',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should not leak error stack traces', async () => {
      prisma.event.findFirst.mockRejectedValue(new Error('Internal error'));

      const token = jwtService.sign({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId,
      });

      const response = await request(app.getHttpServer())
        .get('/events/fail-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.stack).toBeUndefined();
      expect(response.body.correlationId).toBeDefined();
    });
  });
});
