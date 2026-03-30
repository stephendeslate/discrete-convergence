// TRACED:SEC-SUITE — Security tests for Analytics Engine API
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { mockPrismaService, PrismaService } from './helpers/mock-prisma';

describe('Security (e2e)', () => {
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

  // TRACED:SEC-UNAUTH — Protected endpoints reject unauthenticated requests
  it('should reject unauthenticated dashboard request', async () => {
    const response = await request(app.getHttpServer()).get('/dashboards');
    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // TRACED:SEC-INVALID-JWT — Invalid JWT is rejected
  it('should reject invalid JWT', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer invalid-jwt-token');

    expect(response.status).toBe(401);
    expect(response.body).toBeDefined();
  });

  // TRACED:SEC-MALFORMED-AUTH — Malformed authorization header is rejected
  it('should reject malformed auth header', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'NotBearer token');

    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // TRACED:SEC-EXTRA-FIELDS — Validation pipe rejects extra fields
  it('should reject extra fields in body', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'ADMIN',
      });

    expect(response.status).toBe(400);
    expect(response.body.statusCode).toBe(400);
  });

  // TRACED:SEC-SHORT-PASSWORD — Password too short is rejected
  it('should reject short passwords', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
  });

  // TRACED:SEC-HEALTH-PUBLIC — Health endpoints accessible without auth
  it('health endpoints should not require auth', async () => {
    const healthResponse = await request(app.getHttpServer()).get('/health');
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.status).toBe('ok');
  });

  // TRACED:SEC-SQL-INJECTION — SQL injection attempts are rejected
  it('should not be vulnerable to SQL injection in query params', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboards?page=1;DROP TABLE dashboards;--');
    expect(response.status).toBeDefined();
    expect(response.status).not.toBe(500);
  });

  // TRACED:SEC-XSS — XSS attempts in body are handled safely
  it('should handle XSS attempts in body', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: '<script>alert("xss")</script>@test.com',
        password: 'password123',
      });
    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
  });
});
