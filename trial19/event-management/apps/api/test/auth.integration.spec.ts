import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';
import { createTestApp, createMockPrisma } from './helpers/test-utils';

describe('Auth Integration', () => {
  let app: INestApplication;
  const mockPrisma = createMockPrisma();

  beforeAll(async () => {
    app = await createTestApp(mockPrisma);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use BCRYPT_SALT_ROUNDS from shared', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
    expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
  });

  // Register tests - batch 1 (within 3/sec throttle)
  describe('POST /auth/register - valid data', () => {
    it('should register a new user with valid data', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@test.com',
        role: 'VIEWER',
        tenantId: 'tenant-1',
        passwordHash: 'hashed',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@test.com', password: 'password123', role: 'VIEWER', tenantId: 'tenant-1' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123', role: 'VIEWER', tenantId: 'tenant-1' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', role: 'VIEWER', tenantId: 'tenant-1' });

      expect(res.status).toBe(400);
    });
  });

  // Register tests - batch 2 (wait for throttle window to reset)
  describe('POST /auth/register - validation edge cases', () => {
    beforeAll(async () => {
      // Wait for throttle window (1s TTL) to reset
      await new Promise((resolve) => setTimeout(resolve, 1100));
    });

    it('should return 400 when extra fields are sent (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'password123', role: 'VIEWER', tenantId: 'tenant-1', extraField: 'hacked' });

      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'existing@test.com', password: 'password123', role: 'VIEWER', tenantId: 'tenant-1' });

      expect(res.status).toBe(409);
    });

    it('should return 400 when trying to register as ADMIN', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'admin@test.com', password: 'password123', role: 'ADMIN', tenantId: 'tenant-1' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    });

    it('should return 401 for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for empty email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: '', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing password in login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('Protected routes', () => {
    it('should return 401 for unauthenticated request to /events', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid token on /venues', async () => {
      const res = await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('should return 401 for expired token format', async () => {
      const res = await request(app.getHttpServer())
        .get('/attendees')
        .set('Authorization', 'Bearer expired.token.here');
      expect(res.status).toBe(401);
    });
  });
});
