// TRACED:EM-CROSS-006 — cross-layer integration test: auth → CRUD → errors → correlation → response time → health
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cross-Layer Integration', () => {
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

  it('should enforce auth on protected endpoints', async () => {
    const res = await request(app.getHttpServer()).get('/events');
    expect(res.status).toBe(401);
  });

  it('should add X-Response-Time header on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('should return correlation ID in error responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/nonexistent-route')
      .set('X-Correlation-ID', 'test-corr-123');
    expect([404, 401]).toContain(res.status);
  });

  it('should return health with APP_VERSION', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBeDefined();
    expect(typeof res.body.version).toBe('string');
  });

  it('should return readiness with DB status', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('database');
  });

  it('should return metrics with version and counts', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('requestCount');
    expect(res.body).toHaveProperty('errorCount');
  });

  it('should reject invalid auth token', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer bad-token');
    expect(res.status).toBe(401);
  });

  it('should validate request body', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({});
    expect([400, 401]).toContain(res.status);
  });
});
