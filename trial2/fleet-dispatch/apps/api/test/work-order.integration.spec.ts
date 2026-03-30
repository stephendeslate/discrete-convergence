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
        .send({
          customerId: '00000000-0000-0000-0000-000000000000',
          title: 'Test WO',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /work-orders/:id', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders/nonexistent-id');

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

  describe('POST /work-orders/:id/assign', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer())
        .post('/work-orders/some-id/assign')
        .send({ technicianId: '00000000-0000-0000-0000-000000000000' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /work-orders/:id', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/work-orders/some-id');

      expect(response.status).toBe(401);
    });
  });
});
