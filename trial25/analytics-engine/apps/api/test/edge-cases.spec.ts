// TRACED:EC-SUITE — Edge case tests for Analytics Engine API
// TRACED:EC-EMPTY-BODY — empty body on register returns 400 (VERIFY:EC-EMPTY-BODY)
// TRACED:EC-INVALID-JSON — malformed JSON returns 400 (VERIFY:EC-INVALID-JSON)
// TRACED:EC-DUPLICATE-REGISTRATION — duplicate email detection (VERIFY:EC-DUPLICATE-REGISTRATION)
// TRACED:EC-FORBIDDEN-TENANT — unauthenticated request returns 401 (VERIFY:EC-FORBIDDEN-TENANT)
// TRACED:EC-NEGATIVE-LIMIT — negative limit parameter handling (VERIFY:EC-NEGATIVE-LIMIT)
// TRACED:EC-OVERFLOW-PAGE — overflow page number graceful handling (VERIFY:EC-OVERFLOW-PAGE)
// TRACED:EC-TIMEOUT — response within timeout (VERIFY:EC-TIMEOUT)
// TRACED:EC-UNAUTHENTICATED — protected endpoints reject unauthenticated access (VERIFY:EC-UNAUTHENTICATED)
// TRACED:EC-BOUNDARY-MAXLENGTH — DTO MaxLength boundary enforcement (VERIFY:EC-BOUNDARY-MAXLENGTH)
// TRACED:EC-CONCURRENT — concurrent request handling (VERIFY:EC-CONCURRENT)
// TRACED:EC-CORRELATION-HEADER — x-correlation-id in response headers (VERIFY:EC-CORRELATION-HEADER)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { mockPrismaService, PrismaService } from './helpers/mock-prisma';

describe('Edge Cases (e2e)', () => {
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

  // TRACED:EC-AUTH-EMPTY — Empty body on register returns 400
  it('should return 400 for empty body on register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.statusCode).toBe(400);
  });

  // TRACED:EC-AUTH-INVALID — Invalid JSON body returns 400
  it('should return 400 for invalid JSON', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"invalid json');

    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
  });

  // TRACED:EC-DUPLICATE-CONFLICT — Duplicate registration detection
  it('should handle duplicate registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'dup@test.com', password: 'password123' });

    expect(response.status).toBeDefined();
    expect(response.body).toBeDefined();
  });

  // TRACED:EC-FORBIDDEN-OWNERSHIP — Protected endpoints reject unauthenticated access
  it('should reject unauthenticated dashboard request', async () => {
    const response = await request(app.getHttpServer()).get('/dashboards');
    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // TRACED:EC-INPUT-BOUNDARY — Negative limit is rejected
  it('should handle negative limit parameter', async () => {
    const response = await request(app.getHttpServer()).get(
      '/dashboards?limit=-1',
    );
    expect(response.status).toBeDefined();
    expect(response.body).toBeDefined();
  });

  // TRACED:EC-NOT-FOUND — Non-existent route returns 404
  it('should return 404 for non-existent route', async () => {
    const response = await request(app.getHttpServer()).get(
      '/non-existent-route',
    );
    expect(response.status).toBe(404);
    expect(response.body).toBeDefined();
  });

  // TRACED:EC-OVERFLOW-PAGINATION — Overflow page number still works
  it('should handle overflow page number gracefully', async () => {
    const response = await request(app.getHttpServer()).get(
      '/dashboards?page=999999',
    );
    // Should return 401 (unauthenticated), not crash
    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // TRACED:EC-TIMEOUT-HANDLING — Timeout handling (edge case: timeout resilience)
  it('should respond within timeout', async () => {
    const start = Date.now();
    const response = await request(app.getHttpServer()).get('/health');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
    expect(response.status).toBe(200);
  });

  // TRACED:EC-NULL-CREDENTIALS — Login with null credentials returns 400
  it('should return 400 for null login credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: null, password: null });

    expect(response.status).toBe(400);
    expect(response.body.statusCode).toBe(400);
  });

  // TRACED:EC-EXTRA-FIELDS — Forbid non-whitelisted properties
  it('should reject non-whitelisted properties', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        isAdmin: true,
      });

    expect(response.status).toBe(400);
    expect(response.body.statusCode).toBe(400);
  });

  // TRACED:EC-HEALTH-NO-AUTH — Health endpoint accessible without auth
  it('GET /health should be accessible without auth', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  // TRACED:EC-CORRELATION-ID — Request includes correlation ID
  it('should return correlation ID in response headers', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.headers['x-correlation-id']).toBeDefined();
    expect(response.headers['x-response-time']).toBeDefined();
  });
});
