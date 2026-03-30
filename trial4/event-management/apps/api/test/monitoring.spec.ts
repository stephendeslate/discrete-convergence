// TRACED:EM-TEST-006 — monitoring integration tests with supertest (not unit-only)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env['JWT_SECRET'] = 'test-jwt-secret-for-integration';
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env['CORS_ORIGIN'] = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /health', () => {
    it('should return health status without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status without auth', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('database');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics without auth', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requestCount');
      expect(res.body).toHaveProperty('errorCount');
      expect(res.body).toHaveProperty('averageResponseTime');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
    });
  });
});
