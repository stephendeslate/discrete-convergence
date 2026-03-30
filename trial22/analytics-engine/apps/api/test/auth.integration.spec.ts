import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getMockPrisma, resetMocks } from './helpers/test-app';
import bcrypt from 'bcryptjs';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks();
  });

  it('POST /auth/register should register a new user', async () => {
    const prisma = getMockPrisma();
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      name: 'Test',
      role: 'USER',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test',
        role: 'USER',
        tenantId: 't1',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id', 'u1');
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'test@example.com' } }),
    );
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('POST /auth/register should return 409 for duplicate email', async () => {
    const prisma = getMockPrisma();
    prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dup@example.com',
        password: 'Password123!',
        name: 'Dup',
        role: 'USER',
        tenantId: 't1',
      })
      .expect(409);

    expect(res.body).toHaveProperty('statusCode', 409);
    expect(prisma.user.findFirst).toHaveBeenCalled();
  });

  it('POST /auth/login should return tokens', async () => {
    const prisma = getMockPrisma();
    const hashed = await bcrypt.hash('Password123!', 10);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      password: hashed,
      tenantId: 't1',
      role: 'USER',
    });
    prisma.refreshToken.create.mockResolvedValue({ id: 'rt1' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
    expect(typeof res.body.access_token).toBe('string');
    expect(prisma.refreshToken.create).toHaveBeenCalled();
  });

  it('POST /auth/login should return 401 for invalid credentials', async () => {
    const prisma = getMockPrisma();
    prisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bad@example.com', password: 'wrong' })
      .expect(401);

    expect(res.body).toHaveProperty('statusCode', 401);
    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'bad@example.com' } }),
    );
  });
});
