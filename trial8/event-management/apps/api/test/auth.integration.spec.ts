import request from 'supertest';
import { createTestApp, getMockPrisma } from './helpers/test-setup';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// TRACED: EM-TEST-002 — Auth integration tests (VERIFY: EM-AUTH-001 through EM-AUTH-006)

describe('Auth Integration', () => {
  let app: INestApplication;
  const tenantId = '00000000-0000-0000-0000-000000000099';
  const testEmail = 'auth-test@test.com';
  let mockPrisma: ReturnType<typeof getMockPrisma>;

  beforeAll(async () => {
    app = await createTestApp();
    mockPrisma = getMockPrisma();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // VERIFY: EM-AUTH-001 — Registration succeeds with valid data
  it('should register a new user successfully', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null); // no existing user
    mockPrisma.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: testEmail,
      role: 'USER',
      name: 'Test User',
      tenantId,
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'USER',
        tenantId,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(testEmail);
    expect(res.body.role).toBe('USER');
  });

  // VERIFY: EM-AUTH-002 — Duplicate registration returns 409
  it('should reject duplicate email registration', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'existing-user-id',
      email: testEmail,
      role: 'USER',
      tenantId,
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: 'SecurePass123!',
        name: 'Duplicate User',
        role: 'USER',
        tenantId,
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already registered');
  });

  // VERIFY: EM-AUTH-003 — Login succeeds and returns JWT
  it('should login with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('SecurePass123!', 10);
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'login-user-id',
      email: testEmail,
      passwordHash,
      role: 'USER',
      tenantId,
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'SecurePass123!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    expect(typeof res.body.access_token).toBe('string');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testEmail);
  });

  // VERIFY: EM-AUTH-004 — Login with wrong password returns 401
  it('should reject login with wrong password', async () => {
    const passwordHash = await bcrypt.hash('SecurePass123!', 10);
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'login-user-id',
      email: testEmail,
      passwordHash,
      role: 'USER',
      tenantId,
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid credentials');
  });

  // VERIFY: EM-AUTH-005 — Login with non-existent user returns 401
  it('should reject login for non-existent user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'AnyPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid credentials');
  });

  // VERIFY: EM-DATA-001 — Registration rejects invalid role (ADMIN not allowed)
  it('should reject registration with ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin-attempt@test.com',
        password: 'SecurePass123!',
        name: 'Admin Attempt',
        role: 'ADMIN',
        tenantId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // VERIFY: EM-DATA-002 — Registration rejects missing fields
  it('should reject registration with missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'incomplete@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // VERIFY: EM-DATA-003 — Registration rejects invalid email
  it('should reject registration with invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'SecurePass123!',
        name: 'Bad Email',
        role: 'USER',
        tenantId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // VERIFY: EM-AUTH-006 — Authenticated request with valid token succeeds
  it('should access protected endpoint with valid token', async () => {
    const passwordHash = await bcrypt.hash('SecurePass123!', 10);
    const userId = 'auth-protected-user-id';

    // Mock login
    mockPrisma.user.findFirst.mockImplementation(({ where }: any) => {
      if (where?.email === testEmail) {
        return Promise.resolve({ id: userId, email: testEmail, passwordHash, role: 'USER', tenantId });
      }
      if (where?.id === userId) {
        return Promise.resolve({ id: userId, email: testEmail, role: 'USER', tenantId });
      }
      return Promise.resolve(null);
    });

    // Mock event listing
    mockPrisma.event.findMany.mockResolvedValue([]);
    mockPrisma.event.count.mockResolvedValue(0);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'SecurePass123!' });

    const token = loginRes.body.access_token;

    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  // VERIFY: EM-SEC-002 — Unauthenticated request returns 401
  it('should reject protected endpoint without token', async () => {
    const res = await request(app.getHttpServer()).get('/events');

    expect(res.status).toBe(401);
  });
});
