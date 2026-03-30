import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:AE-TST-001 — auth integration tests with supertest and real AppModule
describe('Auth Integration (e2e)', () => {
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

  it('POST /auth/login — should reject invalid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bad@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('POST /auth/login — should reject invalid email format', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('POST /auth/register — should reject missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  it('POST /auth/register — should reject ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test',
        tenantId: '00000000-0000-0000-0000-000000000001',
        role: 'ADMIN',
      });
    expect(res.status).toBe(400);
  });

  it('POST /auth/login — should reject excessively long email', async () => {
    const longEmail = 'a'.repeat(300) + '@test.com';
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: longEmail, password: 'password123' });
    expect(res.status).toBe(400);
  });
});
