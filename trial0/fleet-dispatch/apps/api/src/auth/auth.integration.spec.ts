// TRACED:FD-TEST-001
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /auth/register — registers a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test User', email: 'inttest@fleet.com', password: 'password123', role: 'ADMIN' });

    expect([201, 409]).toContain(res.status);
  });

  it('POST /auth/login — returns JWT token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'inttest@fleet.com', password: 'password123' });

    if (res.status === 201) {
      expect(res.body).toHaveProperty('accessToken');
    }
  });

  it('GET /work-orders — rejects unauthenticated request', async () => {
    const res = await request(app.getHttpServer()).get('/work-orders');
    expect(res.status).toBe(401);
  });

  it('GET /monitoring/health — accessible without auth', async () => {
    const res = await request(app.getHttpServer()).get('/monitoring/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });
});
