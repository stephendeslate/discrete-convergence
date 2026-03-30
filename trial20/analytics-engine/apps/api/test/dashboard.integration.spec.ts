import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
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
    it('should require authentication (401 without token)', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject invalid bearer token (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer bad-token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('POST /dashboards', () => {
    it('should require authentication for creation (401)', async () => {
      const res = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ name: 'Test Dashboard' });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('GET /dashboards/:id', () => {
    it('should require authentication for single dashboard (401)', async () => {
      const res = await request(app.getHttpServer()).get('/dashboards/some-id');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should require authentication for deletion (401)', async () => {
      const res = await request(app.getHttpServer()).delete('/dashboards/some-id');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
