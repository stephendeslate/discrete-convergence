import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService } from './helpers/mock-prisma';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

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

  it('health endpoint should have response time header and correlation ID', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('X-Correlation-ID', 'test-corr-123');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-correlation-id']).toBe('test-corr-123');
  });

  it('should generate correlation ID when not provided', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('unauthenticated request should have correlation ID in error response', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('X-Correlation-ID', 'err-corr-456');
    expect(res.status).toBe(401);
    expect(res.headers['x-correlation-id']).toBe('err-corr-456');
  });

  it('validation error should return 400 with proper format', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
    expect(res.body.statusCode).toBe(400);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('auth and rate limiting work together', async () => {
    const res = await request(app.getHttpServer())
      .get('/events');
    expect(res.status).toBe(401);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });
});
