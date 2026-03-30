import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.getHttpAdapter().getInstance().disable('x-powered-by');
    app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], frameAncestors: ["'none'"] } } }));
    app.enableCors({ origin: 'http://localhost:3000', credentials: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Full pipeline: health → auth → error handling → headers', () => {
    it('should serve health without auth and include all response headers', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.version).toBeDefined();
      expect(res.headers['x-response-time']).toBeDefined();
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('should serve ready endpoint and include DB status', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('database');
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should enforce auth guard on protected routes', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('should reject invalid credentials and return correlation ID', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.headers['x-correlation-id']).toBeDefined();
    });

    it('should handle validation errors with correct status and correlation ID', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid', password: 'x' });

      expect(res.status).toBe(400);
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['x-response-time']).toBeDefined();
    });

    it('should return 404 with JSON for unknown routes', async () => {
      const res = await request(app.getHttpServer()).get('/nonexistent');

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/json/);
    });

    it('should include all security headers on error responses', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');

      expect(res.headers['x-powered-by']).toBeUndefined();
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('should serve metrics publicly', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requestCount');
      expect(res.body).toHaveProperty('uptime');
    });
  });
});
