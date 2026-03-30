import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getMockPrisma, resetMocks } from './helpers/test-app';
import bcrypt from 'bcryptjs';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const prisma = getMockPrisma();
    const hashed = await bcrypt.hash('Password123!', 10);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      password: hashed,
      tenantId: 't1',
      role: 'ADMIN',
    });
    prisma.refreshToken.create.mockResolvedValue({ id: 'rt1' });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'Password123!' });
    accessToken = loginRes.body.access_token;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks();
  });

  it('should flow from controller through service to DB layer for widgets', async () => {
    const prisma = getMockPrisma();
    prisma.widget.findMany.mockResolvedValue([{ id: 'w1', title: 'Chart' }]);
    prisma.widget.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer())
      .get('/widgets')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(1);
    expect(res.body).toHaveProperty('total', 1);
    expect(prisma.widget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 't1' }) }),
    );
  });

  it('should flow from controller through service for data sources', async () => {
    const prisma = getMockPrisma();
    prisma.dataSource.findMany.mockResolvedValue([{ id: 'ds1', name: 'PG' }]);
    prisma.dataSource.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 1);
    expect(prisma.dataSource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 't1' }) }),
    );
  });

  it('should reject validation errors with 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email' })
      .expect(400);

    expect(res.body).toHaveProperty('statusCode', 400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 404 for nonexistent dashboard', async () => {
    const prisma = getMockPrisma();
    prisma.dashboard.findUnique.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .get('/dashboards/nonexistent')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(res.body).toHaveProperty('statusCode', 404);
    expect(prisma.dashboard.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'nonexistent' } }),
    );
  });
});
