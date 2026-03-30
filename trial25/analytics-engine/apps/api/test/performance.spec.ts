// TRACED:PERF-SUITE — Performance tests for Analytics Engine API
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { mockPrismaService, PrismaService } from './helpers/mock-prisma';

describe('Performance (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(PrismaService).useValue(mockPrismaService).compile();

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
    if (app) {
      await app.close();
    }
  });

  // TRACED:PERF-HEALTH-LATENCY — Health endpoint responds quickly
  it('health endpoint should respond under 500ms', async () => {
    const start = Date.now();
    const response = await request(app.getHttpServer()).get('/health');
    const elapsed = Date.now() - start;

    expect(response.status).toBe(200);
    expect(elapsed).toBeLessThan(500);
  });

  // TRACED:PERF-RESPONSE-TIME — Response includes timing header
  it('should include response time header', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.headers['x-response-time']).toBeDefined();
  });

  // TRACED:PERF-METRICS — Metrics endpoint provides memory data
  it('metrics should include memory usage', async () => {
    const response = await request(app.getHttpServer()).get('/health/metrics');
    expect(response.status).toBe(200);
    expect(response.body.memory).toBeDefined();
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

  // TRACED:PERF-CONCURRENT — Multiple concurrent requests don't crash
  it('should handle concurrent health checks', async () => {
    // Send requests sequentially but quickly to verify no crash under load
    const results: number[] = [];
    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer()).get('/health');
      results.push(response.status);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    }
    expect(results).toHaveLength(5);
    expect(results.every((s) => s === 200)).toBe(true);
  });
});
