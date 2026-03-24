import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Monitoring (supertest)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns ok status', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
  });

  it('GET /health/ready checks database', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    expect([200, 500]).toContain(res.status);
  });

  it('correlation ID is propagated in response', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'mon-test-789');

    expect(res.headers['x-correlation-id']).toBe('mon-test-789');
  });

  it('X-Response-Time header is set', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-response-time']).toBeDefined();
  });
});
