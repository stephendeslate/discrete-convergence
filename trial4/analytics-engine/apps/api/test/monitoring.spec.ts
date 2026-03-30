import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:AE-TST-006 — monitoring integration tests with supertest
describe('Monitoring Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health — should return ok status without auth', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('version');
  });

  it('GET /health/ready — should check DB connectivity without auth', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('database');
  });

  it('GET /metrics — should return metrics without auth', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requestCount');
    expect(res.body).toHaveProperty('errorCount');
    expect(res.body).toHaveProperty('averageResponseTime');
    expect(res.body).toHaveProperty('uptime');
  });

  it('should include X-Correlation-ID when client provides one', async () => {
    const correlationId = 'test-correlation-123';
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', correlationId);
    expect(res.status).toBe(200);
  });
});
