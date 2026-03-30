import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, createMockPrisma } from './helpers/test-utils';

describe('Security Integration', () => {
  let app: INestApplication;
  const mockPrisma = createMockPrisma();

  beforeAll(async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    app = await createTestApp(mockPrisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication guards', () => {
    it('should return 401 for unauthenticated GET /events', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid Bearer token on /venues', async () => {
      const res = await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', 'Bearer invalid-jwt-token');
      expect(res.status).toBe(401);
    });

    it('should return 401 for missing token on /registrations', async () => {
      const res = await request(app.getHttpServer()).get('/registrations');
      expect(res.status).toBe(401);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid registration data', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad' });
      expect(res.status).toBe(400);
    });

    it('should reject extra fields with forbidNonWhitelisted', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'password123', role: 'VIEWER', tenantId: 't-1', hack: 'xss' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for SQL injection attempt in login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: "'; DROP TABLE users; --", password: 'password' });
      expect(res.status).toBe(400);
    });
  });

  describe('XSS protection', () => {
    it('should return 404 JSON for script tag in URL', async () => {
      const res = await request(app.getHttpServer())
        .get('/<script>alert(1)</script>');
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Headers', () => {
    it('should not expose X-Powered-By header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should include X-Response-Time header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-response-time']).toMatch(/\d+ms/);
    });

    it('should include X-Correlation-ID header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-correlation-id']).toBeDefined();
    });
  });
});
