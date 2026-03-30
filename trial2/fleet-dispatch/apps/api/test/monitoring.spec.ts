import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@fleet-dispatch/shared';

/**
 * Monitoring integration tests — supertest against real AppModule.
 * TRACED:FD-MON-006
 */
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

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.version).toBe(APP_VERSION);
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /health/ready', () => {
    it('should check database connectivity', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.database).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /metrics', () => {
    it('should return request metrics', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');

      expect(response.status).toBe(200);
      expect(response.body.requestCount).toBeDefined();
      expect(response.body.errorCount).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.status).toBe(200);
    });
  });
});
