import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Work Order Integration', () => {
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

  describe('GET /work-orders', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /work-orders', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .send({ title: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /work-orders/:id/status', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer())
        .patch('/work-orders/some-id/status')
        .send({ status: 'ASSIGNED' });

      expect(response.status).toBe(401);
    });
  });
});
