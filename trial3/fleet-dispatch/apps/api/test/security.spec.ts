import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Integration', () => {
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

  describe('Authentication enforcement', () => {
    it('should return 401 for protected routes without token', async () => {
      const response = await request(app.getHttpServer()).get('/work-orders');
      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
    });
  });

  describe('Input validation', () => {
    it('should reject unknown fields (forbidNonWhitelisted)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'DISPATCHER',
          companyId: '00000000-0000-0000-0000-000000000000',
          unknownField: 'should be rejected',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@hack.com',
          password: 'password123',
          firstName: 'Evil',
          lastName: 'Admin',
          role: 'ADMIN',
          companyId: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Public routes', () => {
    it('should allow health endpoint without auth', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });

    it('should allow login endpoint without auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
          companyId: '00000000-0000-0000-0000-000000000000',
        });
      // May be 401 (invalid creds) but NOT 403 (unauthorized route)
      expect([401, 500]).toContain(response.status);
    });
  });
});
