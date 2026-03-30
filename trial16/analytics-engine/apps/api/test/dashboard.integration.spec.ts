import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService } from './helpers/mock-prisma';

describe('Dashboard Integration', () => {
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

  it('GET /dashboards should return 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('POST /dashboards should return 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .send({ title: 'Test' });
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('GET /dashboards/:id should return 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards/fake-id');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('PUT /dashboards/:id should return 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .put('/dashboards/fake-id')
      .send({ title: 'Updated' });
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('DELETE /dashboards/:id should return 401 without token', async () => {
    const res = await request(app.getHttpServer()).delete('/dashboards/fake-id');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });
});
