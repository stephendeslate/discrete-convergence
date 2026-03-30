import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  createTestApp,
  generateToken,
  PrismaMock,
  TEST_USER,
  TEST_TECHNICIAN_USER,
} from './helpers/test-app';

describe('Security Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaMock;
  let adminToken: string;
  let techToken: string;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    module = ctx.module;
    prisma = ctx.prisma;
    adminToken = generateToken(module, TEST_USER);
    techToken = generateToken(module, TEST_TECHNICIAN_USER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.healthCheck.mockResolvedValue(true);
  });

  describe('Helmet CSP headers', () => {
    it('should include Content-Security-Policy header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['content-security-policy']).toContain("script-src 'self'");
    });

    it('should include X-Content-Type-Options header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('CORS headers', () => {
    it('should return CORS headers for allowed origin', async () => {
      const res = await request(app.getHttpServer())
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Authentication', () => {
    it('should return 401 for requests without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .expect(401);

      expect(res.body).toHaveProperty('statusCode', 401);
    });

    it('should return 401 for invalid token', async () => {
      await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });
  });

  describe('Role-based access control', () => {
    it('should return 403 when TECHNICIAN tries to create work order', async () => {
      await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          title: 'Unauthorized work order',
          description: 'Should be denied',
        })
        .expect(403);
    });

    it('should return 403 when TECHNICIAN tries to create data source', async () => {
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          name: 'Unauthorized source',
          type: 'POSTGRES',
          connectionString: 'postgresql://localhost:5432/test',
        })
        .expect(403);
    });
  });

  describe('Rate limiting', () => {
    it('should include rate limit headers in responses', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.headers).toHaveProperty('x-ratelimit-limit');
      expect(res.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  describe('Error sanitization', () => {
    it('should not expose stack traces in error responses', async () => {
      prisma.workOrder.findFirst.mockRejectedValue(new Error('DB connection failed'));

      const res = await request(app.getHttpServer())
        .get('/work-orders/some-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(res.body).not.toHaveProperty('stack');
      expect(JSON.stringify(res.body)).not.toContain('node_modules');
    });
  });

  describe('Validation', () => {
    it('should reject non-whitelisted properties (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'DISPATCHER',
          companyId: 'company-001',
          hackerField: 'malicious',
        })
        .expect(400);
    });
  });
});
