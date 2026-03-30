import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Dashboard Integration', () => {
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
        email: 'dash-test@example.com',
        password: 'securepass123',
        tenantName: 'Dashboard Tenant',
        role: 'USER',
      });

    authToken = registerRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /dashboards should create a dashboard', () => {
    return request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Dashboard', description: 'Testing' })
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toBe('Test Dashboard');
        expect(res.body.status).toBe('DRAFT');
      });
  });

  it('GET /dashboards should return paginated results', () => {
    return request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.items).toBeDefined();
        expect(res.body.total).toBeDefined();
        expect(res.body.page).toBeDefined();
      });
  });

  it('GET /dashboards should require authentication', () => {
    return request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);
  });

  it('POST /dashboards should reject empty title', () => {
    return request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '', description: 'Testing' })
      .expect(400);
  });
});
