import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:AE-TST-002 — dashboard integration tests with supertest
describe('Dashboard Integration (e2e)', () => {
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

  it('GET /dashboards — should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
  });

  it('POST /dashboards — should require authentication', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .send({ title: 'Test Dashboard' });
    expect(res.status).toBe(401);
  });

  it('POST /dashboards — should reject invalid body when authenticated', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', 'Bearer invalid-token')
      .send({});
    expect(res.status).toBe(401);
  });

  it('GET /dashboards/:id — should require authentication', async () => {
    const res = await request(app.getHttpServer()).get(
      '/dashboards/nonexistent-id',
    );
    expect(res.status).toBe(401);
  });

  it('DELETE /dashboards/:id — should require authentication', async () => {
    const res = await request(app.getHttpServer()).delete(
      '/dashboards/nonexistent-id',
    );
    expect(res.status).toBe(401);
  });
});
