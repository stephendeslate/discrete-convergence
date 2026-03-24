// TRACED:EM-TEST-001 — Auth integration tests with supertest + real AppModule
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration', () => {
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

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: `test-${Date.now()}@test.com`, name: 'Test', password: 'password123', role: 'ATTENDEE' });
    expect([201, 409]).toContain(res.status);
  });

  it('should reject ADMIN registration', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'admin@test.com', name: 'Admin', password: 'password123', role: 'ADMIN' });
    expect(res.status).toBe(400);
  });

  it('should reject missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  it('should reject invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', name: 'Test', password: 'pass', role: 'ATTENDEE' });
    expect(res.status).toBe(400);
  });

  it('should strip extra fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'extra@test.com', name: 'Test', password: 'pass', role: 'ATTENDEE', admin: true });
    expect(res.status).toBe(400);
  });

  it('should reject invalid login credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('should reject refresh without auth', async () => {
    const res = await request(app.getHttpServer()).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});
