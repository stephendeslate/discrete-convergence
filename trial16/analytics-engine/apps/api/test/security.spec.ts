import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService } from './helpers/mock-prisma';

describe('Security Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(PrismaService).useValue(mockPrismaService).compile();

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

  it('should return 401 for protected endpoint without token', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for expired token', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwidGVuYW50SWQiOiJ0MSIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDAwMDAxfQ.invalid';
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should reject requests with forbidden non-whitelisted fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password', malicious: 'data' });
    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('should return 401 for missing token on widget endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/widgets');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('should return 401 for missing token on data-sources endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/data-sources');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });
});
