// TRACED:WIDGET-INT-SUITE — Widget integration tests
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { mockPrismaService, PrismaService } from './helpers/mock-prisma';

describe('Widget Integration (e2e)', () => {
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
    if (app) {
      await app.close();
    }
  });

  // VERIFY:AE-WID-INT-001 — Widgets endpoint requires auth (edge case: unauthorized)
  it('GET /widgets should require authentication', async () => {
    const response = await request(app.getHttpServer()).get('/widgets');
    expect(response.status).toBe(401);
    expect(response.body).toBeDefined();
    expect(response.body.statusCode).toBe(401);
  });

  // VERIFY:AE-WID-INT-002 — Create widget requires auth
  it('POST /widgets should require authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/widgets')
      .send({ title: 'Test', type: 'chart', dashboardId: 'some-id' });

    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // VERIFY:AE-WID-INT-003 — Widget data endpoint requires auth
  it('GET /widgets/:id/data should require authentication', async () => {
    const response = await request(app.getHttpServer()).get(
      '/widgets/some-id/data',
    );
    expect(response.status).toBe(401);
    expect(response.body).toBeDefined();
  });

  // VERIFY:AE-WID-INT-004 — Delete widget requires auth
  it('DELETE /widgets/:id should require authentication', async () => {
    const response = await request(app.getHttpServer()).delete('/widgets/some-id');
    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });
});
