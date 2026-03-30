import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getMockPrisma, resetMocks } from './helpers/test-app';
import bcrypt from 'bcryptjs';

describe('Dashboard Integration', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    // Get a valid JWT for authenticated requests
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
    accessToken = loginRes.body.access_token;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks();
  });

  it('GET /dashboards should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);
  });

  it('GET /dashboards should return paginated list', async () => {
    const prisma = getMockPrisma();
    prisma.dashboard.findMany.mockResolvedValue([{ id: 'd1', title: 'Main' }]);
    prisma.dashboard.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 1);
    expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 't1' }) }),
    );
  });

  it('POST /dashboards should create a dashboard', async () => {
    const prisma = getMockPrisma();
    prisma.dashboard.create.mockResolvedValue({
      id: 'd1',
      title: 'New Dashboard',
      tenantId: 't1',
    });

    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'New Dashboard', description: 'Test' })
      .expect(201);

    expect(res.body).toHaveProperty('id', 'd1');
    expect(res.body).toHaveProperty('title', 'New Dashboard');
    expect(prisma.dashboard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'New Dashboard', tenantId: 't1' }),
      }),
    );
  });
});
