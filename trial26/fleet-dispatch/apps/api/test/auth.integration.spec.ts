// VERIFY:FD-AUTH-INT-001 — Auth: register creates user and returns tokens
// VERIFY:FD-AUTH-INT-002 — Auth: register rejects invalid email

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, MockPrismaService } from './helpers/test-utils';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: MockPrismaService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          tenantId: 'tenant-1',
        })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          tenantId: 'tenant-1',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });
});
