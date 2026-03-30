import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Performance Integration', () => {
  let app: INestApplication;
  let authToken: string;

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

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'perf-test@example.com',
        password: 'securepass123',
        tenantName: 'Perf Tenant',
        role: 'USER',
      });

    authToken = registerRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include X-Response-Time header', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-response-time']).toBeDefined();
      });
  });

  it('should return Cache-Control on list endpoints', () => {
    return request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.headers['cache-control']).toBeDefined();
      });
  });

  it('should support pagination parameters', () => {
    return request(app.getHttpServer())
      .get('/dashboards?page=1&pageSize=5')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(5);
      });
  });

  it('should clamp oversized page size', () => {
    return request(app.getHttpServer())
      .get('/dashboards?page=1&pageSize=500')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.pageSize).toBeLessThanOrEqual(100);
      });
  });
});
