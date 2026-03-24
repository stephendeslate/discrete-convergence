// TRACED:EM-TEST-005 — Security integration tests with supertest
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should reject unauthenticated requests to protected routes', async () => {
    const res = await request(app.getHttpServer()).get('/api/events');
    expect(res.status).toBe(401);
  });

  it('should validate input and reject extra fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        name: 'Test',
        password: 'pass',
        role: 'ATTENDEE',
        isAdmin: true,
      });
    expect(res.status).toBe(400);
  });

  it('should reject excessively long strings', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        name: 'x'.repeat(200),
        password: 'pass',
        role: 'ATTENDEE',
      });
    expect(res.status).toBe(400);
  });

  it('should sanitize error responses (no stack traces)', async () => {
    const res = await request(app.getHttpServer()).get('/api/events');
    expect(res.body.stack).toBeUndefined();
    expect(res.body.correlationId).toBeDefined();
  });

  it('should reject unknown roles', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'hacker@test.com',
        name: 'Hacker',
        password: 'pass',
        role: 'SUPERADMIN',
      });
    expect(res.status).toBe(400);
  });
});
