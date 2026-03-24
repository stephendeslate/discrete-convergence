import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security (supertest)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('protected routes return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/dashboards').expect(401);
    await request(app.getHttpServer()).get('/data-sources').expect(401);
    await request(app.getHttpServer()).get('/metrics').expect(401);
  });

  it('public routes are accessible without auth', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });

  it('rejects requests with unknown properties', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'EDITOR',
        tenantId: 'tid',
        malicious: 'payload',
      });
    expect(res.status).toBe(400);
  });
});
