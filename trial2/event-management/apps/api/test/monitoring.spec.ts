import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:EM-TEST-004 — Monitoring integration tests with supertest

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

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should include timestamp', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.body.timestamp).toBeDefined();
    });

    it('should include uptime', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(typeof res.body.uptime).toBe('number');
    });

    it('should include version', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.body.version).toBeDefined();
    });

    it('should be accessible without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /health/ready', () => {
    it('should return database status', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('database');
    });

    it('should be accessible without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics data', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requestCount');
      expect(res.body).toHaveProperty('errorCount');
      expect(res.body).toHaveProperty('averageResponseTime');
      expect(res.body).toHaveProperty('uptime');
    });

    it('should be accessible without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/metrics');
      expect(res.status).toBe(200);
    });
  });
});
