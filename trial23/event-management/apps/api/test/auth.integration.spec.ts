import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { createTestApp, generateTestToken, uniqueEmail } from './helpers/test-app';

describe('Auth Integration', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof import('./helpers/test-app')['buildMockPrismaService']>['prisma'];

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a user with valid data', async () => {
      const email = uniqueEmail();
      prisma.user.findFirst.mockResolvedValueOnce(null); // no existing user
      prisma.organization.findFirst.mockResolvedValueOnce({
        id: 'org-uuid-001',
        name: 'Default',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.user.create.mockResolvedValueOnce({
        id: 'user-new-001',
        email,
        name: 'New User',
        role: 'ORGANIZER',
        passwordHash: 'hashed',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'StrongPass123!', name: 'New User', role: 'ORGANIZER' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(email);
      expect(res.body.name).toBe('New User');
      expect(res.body.role).toBe('ORGANIZER');
    });

    it('should reject duplicate email with 409', async () => {
      const email = uniqueEmail();
      prisma.user.findFirst.mockResolvedValueOnce({
        id: 'existing-user-001',
        email,
        name: 'Existing',
        role: 'ORGANIZER',
        passwordHash: 'hashed',
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'StrongPass123!', name: 'Duplicate', role: 'ORGANIZER' })
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.message).toContain('already registered');
    });

    it('should reject ADMIN role with 403', async () => {
      const email = uniqueEmail();

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'StrongPass123!', name: 'Admin Try', role: 'ADMIN' })
        .expect(403);

      expect(res.body.statusCode).toBe(403);
      expect(res.body.message).toContain('not allowed');
    });

    it('should reject missing fields with 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'partial@example.com' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should reject invalid email format with 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'StrongPass123!', name: 'Bad', role: 'ORGANIZER' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should reject short password with 400', async () => {
      const email = uniqueEmail();
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'short', name: 'Bad', role: 'ORGANIZER' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should reject invalid role value with 400', async () => {
      const email = uniqueEmail();
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'StrongPass123!', name: 'Bad Role', role: 'INVALID_ROLE' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should create default organization if none exists', async () => {
      const email = uniqueEmail();
      prisma.user.findFirst.mockResolvedValueOnce(null);
      prisma.organization.findFirst.mockResolvedValueOnce(null); // no default org
      prisma.organization.create.mockResolvedValueOnce({
        id: 'org-new-001',
        name: 'Default',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.user.create.mockResolvedValueOnce({
        id: 'user-new-002',
        email,
        name: 'Org User',
        role: 'ATTENDEE',
        passwordHash: 'hashed',
        organizationId: 'org-new-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'StrongPass123!', name: 'Org User', role: 'ATTENDEE' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(prisma.organization.create).toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should return tokens on successful login', async () => {
      const email = uniqueEmail();
      const hash = await bcrypt.hash('StrongPass123!', 12);
      prisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-uuid-login',
        email,
        name: 'Login User',
        role: 'ORGANIZER',
        passwordHash: hash,
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'StrongPass123!' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(typeof res.body.access_token).toBe('string');
      expect(typeof res.body.refresh_token).toBe('string');
    });

    it('should return 401 for wrong password', async () => {
      const email = uniqueEmail();
      const hash = await bcrypt.hash('CorrectPassword1!', 12);
      prisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-uuid-wrong',
        email,
        name: 'Wrong PW',
        role: 'ORGANIZER',
        passwordHash: hash,
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'WrongPassword99!' })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should return 401 for unknown email', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'unknown@example.com', password: 'AnyPassword123!' })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('Protected routes', () => {
    it('should return 401 without token on protected endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('should return 200 with valid token on protected endpoint', async () => {
      const token = generateTestToken(app);

      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });
  });
});
