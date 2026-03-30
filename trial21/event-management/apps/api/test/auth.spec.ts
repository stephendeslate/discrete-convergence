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

describe('AuthController', () => {
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

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  describe('POST /auth/login', () => {
    it('should return tokens for valid input', async () => {
      mockAuthService.login.mockResolvedValue({
        access_token: 'at', refresh_token: 'rt',
      });
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(201);
      expect(res.body.access_token).toBe('at');
      expect(res.body.refresh_token).toBe('rt');
    });

    it('should reject missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'password123' })
        .expect(400);
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(400);
    });

    it('should reject short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'short' })
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should return tokens for valid registration', async () => {
      mockAuthService.register.mockResolvedValue({
        access_token: 'at', refresh_token: 'rt',
      });
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com', password: 'password123',
          firstName: 'New', lastName: 'User',
          organizationId: 'org-001', role: 'ATTENDEE',
        })
        .expect(201);
      expect(res.body.access_token).toBe('at');
    });

    it('should reject invalid role', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com', password: 'password123',
          firstName: 'New', lastName: 'User',
          organizationId: 'org-001', role: 'ADMIN',
        })
        .expect(400);
    });

    it('should reject missing fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@example.com' })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access token', async () => {
      mockAuthService.refresh.mockResolvedValue({ access_token: 'new-at' });
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'valid-rt' })
        .expect(201);
      expect(res.body.access_token).toBe('new-at');
    });
  });
});
