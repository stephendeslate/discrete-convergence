import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Monitoring Integration', () => {
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

  it('GET /health should return status ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.version).toBeDefined();
        expect(res.body.uptime).toBeDefined();
        expect(res.body.timestamp).toBeDefined();
      });
  });

  it('GET /health/ready should check database connectivity', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBeDefined();
        expect(res.body.database).toBeDefined();
      });
  });

  it('GET /metrics should return request counts', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect((res) => {
        expect(res.body.requestCount).toBeDefined();
        expect(res.body.errorCount).toBeDefined();
        expect(res.body.uptime).toBeDefined();
      });
  });

  it('GET /health should not require authentication', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });
});
