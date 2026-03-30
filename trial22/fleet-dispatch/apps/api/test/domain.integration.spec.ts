import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, mockPrismaService } from './helpers/test-app';

describe('Domain Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-integration';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const testApp = await createTestApp();
    app = testApp.app;

    const jwtService = app.get(JwtService);
    token = jwtService.sign({ sub: 'u1', email: 'test@test.com', role: 'ADMIN', tenantId: 't1' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mocks
    mockPrismaService.vehicle.findMany.mockResolvedValue([]);
    mockPrismaService.vehicle.count.mockResolvedValue(0);
  });

  // VERIFY: FD-DOMAIN-INT-001 — vehicles list requires auth
  it('GET /vehicles should return 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/vehicles')
      .expect(401);
  });

  // VERIFY: FD-DOMAIN-INT-002 — vehicles list with auth returns data
  it('GET /vehicles should return paginated data with valid token', async () => {
    mockPrismaService.vehicle.findMany.mockResolvedValue([{ id: 'v1', vin: '12345678901234567' }]);
    mockPrismaService.vehicle.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 1);
    expect(res.body.data).toHaveLength(1);
  });

  // VERIFY: FD-DOMAIN-INT-003 — create vehicle
  it('POST /vehicles should create a vehicle', async () => {
    mockPrismaService.vehicle.create.mockResolvedValue({
      id: 'v1', vin: '12345678901234567', licensePlate: 'ABC-1234', make: 'Ford', model: 'Transit', year: 2024, mileage: 0, tenantId: 't1',
    });

    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ vin: '12345678901234567', licensePlate: 'ABC-1234', make: 'Ford', model: 'Transit', year: 2024, mileage: 0 })
      .expect(201);

    expect(res.body).toHaveProperty('id', 'v1');
    expect(mockPrismaService.vehicle.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1' }) }),
    );
  });

  // VERIFY: FD-DOMAIN-INT-004 — drivers list with auth
  it('GET /drivers should return paginated drivers', async () => {
    mockPrismaService.driver.findMany.mockResolvedValue([{ id: 'd1' }]);
    mockPrismaService.driver.count.mockResolvedValue(1);

    const res = await request(app.getHttpServer())
      .get('/drivers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('total', 1);
  });

  // VERIFY: FD-DOMAIN-INT-005 — routes list with auth
  it('GET /routes should return paginated routes', async () => {
    mockPrismaService.route.findMany.mockResolvedValue([]);
    mockPrismaService.route.count.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/routes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(0);
  });
});
