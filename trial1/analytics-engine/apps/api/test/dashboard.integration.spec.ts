import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Dashboard Integration', () => {
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

  describe('GET /dashboards', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });
  });

  describe('POST /dashboards', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .send({ title: 'Test Dashboard' })
        .expect(401);
    });

    it('should reject invalid body', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .send({})
        .expect(401);
    });
  });
});
