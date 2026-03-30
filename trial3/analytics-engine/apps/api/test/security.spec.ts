import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

describe('Security Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            frameAncestors: ["'none'"],
          },
        },
      }),
    );

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

  it('should set CSP headers', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.headers['content-security-policy']).toBeDefined();
      });
  });

  it('should reject requests with unknown fields', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'pass', extraField: 'bad' })
      .expect(400);
  });

  it('should require authentication for protected endpoints', () => {
    return request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);
  });

  it('should reject malformed JWT tokens', () => {
    return request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('should allow access to public health endpoint', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });
});
