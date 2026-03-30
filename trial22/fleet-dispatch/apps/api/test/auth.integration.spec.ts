import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, mockPrismaService } from './helpers/test-app';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-integration';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // VERIFY: FD-AUTH-INT-001 — registration returns user without password
  it('POST /auth/register should create user and return id', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    mockPrismaService.user.findFirst.mockResolvedValue(null);
    mockPrismaService.user.create.mockResolvedValue({
      id: 'u1', email: 'new@test.com', name: 'New User', role: 'USER', tenantId: 't1',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'new@test.com', password: 'password123', name: 'New User', role: 'USER', tenantId: 't1' })
      .expect(201);

    expect(res.body).toHaveProperty('id', 'u1');
    expect(res.body).not.toHaveProperty('password');
    expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
  });

  // VERIFY: FD-AUTH-INT-002 — duplicate email returns 409
  it('POST /auth/register should return 409 for duplicate email', async () => {
    mockPrismaService.user.findFirst.mockResolvedValue({ id: 'u1' });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', name: 'Dup', role: 'USER', tenantId: 't1' })
      .expect(409);
  });

  // VERIFY: FD-AUTH-INT-003 — login returns tokens
  it('POST /auth/login should return access_token and refresh_token', async () => {
    mockPrismaService.user.findFirst.mockResolvedValue({
      id: 'u1', email: 'login@test.com', password: 'hashed', role: 'USER', tenantId: 't1',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  // VERIFY: FD-AUTH-INT-004 — invalid credentials return 401
  it('POST /auth/login should return 401 for invalid credentials', async () => {
    mockPrismaService.user.findFirst.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpass' })
      .expect(401);
  });

  // VERIFY: FD-AUTH-INT-005 — validation rejects invalid email
  it('POST /auth/register rejects invalid email format', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'password123', name: 'A', role: 'USER', tenantId: 't1' })
      .expect(400);
  });
});
