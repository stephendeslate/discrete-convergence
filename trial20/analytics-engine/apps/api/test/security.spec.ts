import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

describe('Security Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.getHttpAdapter().getInstance().disable('x-powered-by');
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            frameAncestors: ["'none'"],
          },
        },
      }),
    );
    app.enableCors({ origin: 'http://localhost:3000', credentials: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Security headers', () => {
    it('should include Content-Security-Policy header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('should not include X-Powered-By header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should include X-Content-Type-Options header', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Authentication enforcement', () => {
    it('should return 401 for unauthenticated dashboard access', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');
      expect(res.status).toBe(401);
    });

    it('should return 401 for unauthenticated data source access', async () => {
      const res = await request(app.getHttpServer()).get('/data-sources');
      expect(res.status).toBe(401);
    });

    it('should return 401 for unauthenticated widget access', async () => {
      const res = await request(app.getHttpServer()).get('/widgets');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token-here');
      expect(res.status).toBe(401);
    });
  });

  // TRACED: AE-EDGE-008 — XSS payload in string fields is stored safely (no raw HTML rendering)
  describe('Input validation', () => {
    it('should reject SQL injection in login body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: "'; DROP TABLE users; --", password: 'pass123' });
      expect([400, 401]).toContain(res.status);
    });

    it('should reject XSS in register body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: '<script>alert(1)</script>@test.com',
          password: 'password123',
          role: 'VIEWER',
          tenantId: 'tenant-1',
        });
      expect(res.status).toBe(400);
    });

    it('should reject unknown fields on register', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          role: 'VIEWER',
          tenantId: 'tenant-1',
          isAdmin: true,
        });
      expect(res.status).toBe(400);
    });
  });

  describe('XSS protection', () => {
    it('should return JSON for unknown routes (not HTML)', async () => {
      const res = await request(app.getHttpServer())
        .get('/<script>alert(1)</script>');
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });
});
