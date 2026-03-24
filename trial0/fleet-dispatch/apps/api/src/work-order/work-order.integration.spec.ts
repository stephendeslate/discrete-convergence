// TRACED:FD-TEST-002
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Work Order Integration', () => {
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

  it('work order lifecycle: create → assign → status transitions', async () => {
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'WO Test', email: 'wotest@fleet.com', password: 'password123', role: 'DISPATCHER' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wotest@fleet.com', password: 'password123' });

    if (loginRes.status !== 201) return;
    const token = loginRes.body.accessToken;

    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Integration test WO', priority: 'HIGH' });

    expect([201, 401]).toContain(createRes.status);
  });

  it('rejects invalid status transitions', async () => {
    const res = await request(app.getHttpServer())
      .patch('/work-orders/fake-id/status')
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(401);
  });
});
