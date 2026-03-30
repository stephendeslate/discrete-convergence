// TRACED:FD-SEC-006 — Security integration tests
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
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          frameAncestors: ["'none'"],
        },
      },
    }));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include CSP headers', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('should include X-Content-Type-Options header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app.getHttpServer()).get('/work-orders');
    expect(res.status).toBe(401);
  });

  it('should reject registration with ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'test1234', role: 'ADMIN' });
    expect(res.status).toBe(400);
  });

  it('should reject requests with extra fields (forbidNonWhitelisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'test', injection: 'malicious' });
    expect(res.status).toBe(400);
  });

  it('should strip unknown fields from request body', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'strip@test.com', password: 'test1234', role: 'DISPATCHER', admin: true });
    expect(res.status).toBe(400);
  });
});
