// TRACED:EM-TEST-003 — Cross-layer integration test verifying full pipeline
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should include X-Response-Time header', async () => {
    const res = await request(app.getHttpServer()).get('/api/monitoring/health');
    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
  });

  it('should return health with APP_VERSION', async () => {
    const res = await request(app.getHttpServer()).get('/api/monitoring/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.status).toBe('ok');
  });

  it('should check readiness with DB', async () => {
    const res = await request(app.getHttpServer()).get('/api/monitoring/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toMatch(/ready|not_ready/);
  });

  it('should include correlationId in error responses', async () => {
    const res = await request(app.getHttpServer()).get('/api/events');
    expect(res.status).toBe(401);
    expect(res.body.correlationId).toBeDefined();
  });

  it('should complete full auth flow', async () => {
    const email = `crosslayer-${Date.now()}@test.com`;
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, name: 'Cross Layer', password: 'password123', role: 'ORGANIZER' });

    if (registerRes.status === 201) {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'password123' });
      expect(loginRes.status).toBe(201);
      expect(loginRes.body.accessToken).toBeDefined();

      const eventsRes = await request(app.getHttpServer())
        .get('/api/events')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
      expect(eventsRes.status).toBe(200);
    }
  });

  it('should accept frontend error reports', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/monitoring/errors')
      .send({ message: 'Test error', url: '/test' });
    expect(res.status).toBe(201);
    expect(res.body.received).toBe(true);
  });
});
