import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Performance (supertest)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responses include X-Response-Time header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
  });

  it('health endpoint responds quickly', async () => {
    const start = Date.now();
    await request(app.getHttpServer()).get('/health').expect(200);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
