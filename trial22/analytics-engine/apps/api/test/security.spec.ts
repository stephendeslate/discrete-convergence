import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getMockPrisma, resetMocks } from './helpers/test-app';
import bcrypt from 'bcryptjs';

describe('Security Integration', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const prisma = getMockPrisma();
    const hashed = await bcrypt.hash('Password123!', 10);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'admin@test.com',
      password: hashed,
      tenantId: 't1',
      role: 'ADMIN',
    });
    prisma.refreshToken.create.mockResolvedValue({ id: 'rt1' });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123!' });
    adminToken = loginRes.body.access_token;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks();
  });

  it('should reject requests with invalid JWT', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(res.body).toHaveProperty('statusCode', 401);
  });

  it('should reject requests without Authorization header', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);

    expect(res.body).toHaveProperty('statusCode', 401);
  });

  it('should include correlation ID in error responses', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('X-Correlation-ID', 'test-corr-123')
      .expect(401);

    expect(res.body).toHaveProperty('correlationId', 'test-corr-123');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should allow public endpoints without auth (health)', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version');
  });

  it('DELETE /dashboards/:id should require ADMIN role', async () => {
    const prisma = getMockPrisma();
    prisma.dashboard.findUnique.mockResolvedValue({ id: 'd1', tenantId: 't1' });
    prisma.dashboard.delete.mockResolvedValue({ id: 'd1' });

    const res = await request(app.getHttpServer())
      .delete('/dashboards/d1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', 'd1');
    expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
  });
});
