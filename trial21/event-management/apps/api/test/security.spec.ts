import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
};

/** TRACED:EM-SEC-012 — Security-focused negative tests */
describe('Security', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });
  beforeEach(() => jest.clearAllMocks());

  it('should reject extra fields in login body', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'password123', admin: true })
      .expect(400);
  });

  it('should reject SQL injection in email', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: "' OR 1=1 --", password: 'password123' })
      .expect(400);
  });

  it('should reject extremely long password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'x'.repeat(200) })
      .expect(400);
  });

  it('should reject register with ADMIN role', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'a@b.com', password: 'password123',
        firstName: 'A', lastName: 'B',
        organizationId: 'org1', role: 'ADMIN',
      })
      .expect(400);
  });

  it('should reject register with ORGANIZER role', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'a@b.com', password: 'password123',
        firstName: 'A', lastName: 'B',
        organizationId: 'org1', role: 'ORGANIZER',
      })
      .expect(400);
  });

  it('should reject empty body', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);
  });
});
