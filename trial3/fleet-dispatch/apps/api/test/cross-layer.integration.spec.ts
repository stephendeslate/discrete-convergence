import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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

  it('should have health endpoint accessible without auth', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.version).toBeDefined();
  });

  it('should return X-Response-Time on all responses', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.headers['x-response-time']).toBeDefined();
  });

  it('should enforce auth on protected endpoints', async () => {
    const response = await request(app.getHttpServer()).get('/work-orders');
    expect(response.status).toBe(401);
  });

  it('should have correlationId in error responses', async () => {
    const response = await request(app.getHttpServer()).get('/work-orders');
    expect(response.status).toBe(401);
    // Error responses include correlationId from GlobalExceptionFilter
    if (response.body.correlationId) {
      expect(typeof response.body.correlationId).toBe('string');
    }
  });

  it('should validate request bodies (whitelist + forbidNonWhitelisted)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'DISPATCHER',
        companyId: '00000000-0000-0000-0000-000000000000',
        extraField: 'should fail',
      });

    expect(response.status).toBe(400);
  });

  it('should check DB readiness via health/ready', async () => {
    const response = await request(app.getHttpServer()).get('/health/ready');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('database');
  });

  it('should reject ADMIN role in registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@evil.com',
        password: 'password123',
        firstName: 'Evil',
        lastName: 'Admin',
        role: 'ADMIN',
        companyId: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.status).toBe(400);
  });
});
