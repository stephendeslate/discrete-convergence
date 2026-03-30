// TRACED:DASH-INT-SUITE — Dashboard integration tests
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { mockPrismaService, PrismaService } from './helpers/mock-prisma';

describe('Dashboard Integration (e2e)', () => {
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

  // VERIFY:AE-DASH-INT-001 — Dashboards endpoint requires auth (edge case: unauthorized)
  it('GET /dashboards should require authentication', async () => {
    const response = await request(app.getHttpServer()).get('/dashboards');
    expect(response.status).toBe(401);
    expect(response.body).toBeDefined();
    expect(response.body.statusCode).toBe(401);
  });

  // VERIFY:AE-DASH-INT-002 — Create dashboard requires auth
  it('POST /dashboards should require authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/dashboards')
      .send({ name: 'Test Dashboard' });

    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // VERIFY:AE-DASH-INT-003 — Dashboard by ID requires auth (edge case: forbidden)
  it('GET /dashboards/:id should require authentication', async () => {
    const response = await request(app.getHttpServer()).get(
      '/dashboards/some-id',
    );
    expect(response.status).toBe(401);
    expect(response.body).toBeDefined();
  });

  // VERIFY:AE-DASH-INT-004 — Update dashboard requires auth
  it('PUT /dashboards/:id should require authentication', async () => {
    const response = await request(app.getHttpServer())
      .put('/dashboards/some-id')
      .send({ name: 'Updated' });

    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // VERIFY:AE-DASH-INT-005 — Delete dashboard requires auth
  it('DELETE /dashboards/:id should require authentication', async () => {
    const response = await request(app.getHttpServer()).delete('/dashboards/some-id');
    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });
});
