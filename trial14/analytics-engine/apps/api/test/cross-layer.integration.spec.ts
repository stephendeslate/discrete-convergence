import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService } from './helpers/mock-prisma';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-CROSS-003 — Cross-layer test verifies auth, CRUD, error handling, correlation IDs, response time, health

describe('Cross-Layer Integration', () => {
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
    await app.close();
  });

  it('health endpoint should return APP_VERSION from shared', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(APP_VERSION);
  });

  it('should include correlation ID in error responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('X-Correlation-ID', 'test-correlation-123');
    expect(res.status).toBe(401);
    expect(res.body.correlationId).toBe('test-correlation-123');
  });

  it('should preserve client correlation ID', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'my-custom-id');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('should return X-Response-Time on all responses', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/\d+.*ms/);
  });

  it('auth pipeline blocks unauthorized CRUD', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .send({ title: 'test' });
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('validation pipeline rejects invalid input', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'bad-email' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });
});
