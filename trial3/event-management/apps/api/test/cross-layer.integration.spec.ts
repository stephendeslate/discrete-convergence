// TRACED:EM-CROSS-001
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@event-management/shared';

describe('Cross-Layer Integration', () => {
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

  it('should enforce auth guard globally (no per-controller guard needed)', async () => {
    const eventsResponse = await request(app.getHttpServer()).get('/events');
    expect(eventsResponse.status).toBe(401);

    const venuesResponse = await request(app.getHttpServer()).get('/venues');
    expect(venuesResponse.status).toBe(401);

    const notificationsResponse = await request(app.getHttpServer()).get(
      '/notifications',
    );
    expect(notificationsResponse.status).toBe(401);
  });

  it('should allow public endpoints without auth', async () => {
    const healthResponse = await request(app.getHttpServer()).get('/health');
    expect(healthResponse.status).toBe(200);

    const readyResponse = await request(app.getHttpServer()).get(
      '/health/ready',
    );
    expect(readyResponse.status).toBe(200);
  });

  it('should return X-Response-Time on all responses', async () => {
    const healthResponse = await request(app.getHttpServer()).get('/health');
    expect(healthResponse.headers['x-response-time']).toBeDefined();

    const authResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password',
        organizationId: '00000000-0000-0000-0000-000000000001',
      });
    expect(authResponse.headers['x-response-time']).toBeDefined();
  });

  it('should return correlationId in error responses', async () => {
    const response = await request(app.getHttpServer()).get('/events');
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('correlationId');
  });

  it('should return APP_VERSION in health endpoint from shared package', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.body.version).toBe(APP_VERSION);
  });

  it('should return properly structured error response', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
  });

  it('should handle validation errors for invalid input', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'x',
        name: '',
        role: 'SUPER_ADMIN',
        organizationId: 'not-a-uuid',
      });

    expect(response.status).toBe(400);
  });
});
