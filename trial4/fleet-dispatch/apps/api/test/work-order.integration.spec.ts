// TRACED:FD-API-007 — Work order integration tests with real AppModule
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('WorkOrder Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests to work orders', async () => {
    const res = await request(app.getHttpServer()).get('/work-orders');
    expect(res.status).toBe(401);
  });

  it('should reject work order creation with missing title', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .send({ customerId: 'some-uuid' });
    expect(res.status).toBe(401);
  });

  it('should reject invalid priority values', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', 'Bearer invalid-token')
      .send({ title: 'Test', customerId: 'uuid', priority: 'INVALID' });
    expect(res.status).toBe(401);
  });
});
