import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Integration', () => {
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

  it('should require auth for protected endpoints', async () => {
    const response = await request(app.getHttpServer()).get('/events');
    expect(response.status).toBe(401);
  });

  it('should allow public health endpoint without auth', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
  });

  it('should reject requests with extra fields via validation', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        organizationId: '00000000-0000-0000-0000-000000000001',
        malicious: 'data',
      });

    expect(response.status).toBe(400);
  });

  it('should return proper error structure', async () => {
    const response = await request(app.getHttpServer()).get('/events');
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body).toHaveProperty('message');
  });

  it('should allow auth register endpoint publicly', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'invalid',
        password: 'x',
        name: 'T',
        role: 'ATTENDEE',
        organizationId: '00000000-0000-0000-0000-000000000001',
      });

    // Should get 400 (validation) not 401 (auth) — proves it is public
    expect(response.status).toBe(400);
  });
});
