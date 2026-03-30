// TRACED:DS-INT-SUITE — Data source integration tests
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { mockPrismaService, PrismaService } from './helpers/mock-prisma';

describe('DataSource Integration (e2e)', () => {
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

  // VERIFY:AE-DS-INT-001 — Data sources endpoint requires auth
  it('GET /data-sources should require authentication', async () => {
    const response = await request(app.getHttpServer()).get('/data-sources');
    expect(response.status).toBe(401);
    expect(response.body).toBeDefined();
    expect(response.body.statusCode).toBe(401);
  });

  // VERIFY:AE-DS-INT-002 — Create data source requires auth
  it('POST /data-sources should require authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/data-sources')
      .send({ name: 'Test', type: 'postgresql', connectionString: 'postgres://localhost' });

    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // VERIFY:AE-DS-INT-003 — Sync requires auth (edge case: unauthorized)
  it('POST /data-sources/:id/sync should require authentication', async () => {
    const response = await request(app.getHttpServer()).post(
      '/data-sources/some-id/sync',
    );
    expect(response.status).toBe(401);
    expect(response.body).toBeDefined();
  });

  // VERIFY:AE-DS-INT-004 — Test connection requires auth
  it('POST /data-sources/:id/test-connection should require auth', async () => {
    const response = await request(app.getHttpServer()).post(
      '/data-sources/some-id/test-connection',
    );
    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });

  // VERIFY:AE-DS-INT-005 — Delete data source requires auth
  it('DELETE /data-sources/:id should require authentication', async () => {
    const response = await request(app.getHttpServer()).delete('/data-sources/some-id');
    expect(response.status).toBe(401);
    expect(response.body.statusCode).toBe(401);
  });
});
