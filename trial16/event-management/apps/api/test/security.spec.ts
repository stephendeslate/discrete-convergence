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
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

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

  it('should return 401 for unauthenticated GET /events', async () => {
    const res = await request(app.getHttpServer()).get('/events');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  it('should return 401 for unauthenticated GET /venues', async () => {
    const res = await request(app.getHttpServer()).get('/venues');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  it('should return 401 for unauthenticated GET /attendees', async () => {
    const res = await request(app.getHttpServer()).get('/attendees');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  it('should return 401 for unauthenticated GET /registrations', async () => {
    const res = await request(app.getHttpServer()).get('/registrations');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  it('should return 401 with expired token', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlZJRVdFUiIsInRlbmFudElkIjoiMSIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDAwMDAxfQ.invalid';
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });
});
