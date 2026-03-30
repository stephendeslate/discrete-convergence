import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, generateTestToken, MockPrismaService } from './helpers/test-utils';

describe('Driver Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: MockPrismaService;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    token = generateTestToken();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /drivers', () => {
    it('should return paginated drivers', async () => {
      prisma.driver.findMany.mockResolvedValue([]);
      prisma.driver.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/drivers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /drivers', () => {
    it('should create a driver', async () => {
      prisma.driver.create.mockResolvedValue({
        id: 'd-1',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '555-0100',
        licenseNumber: 'DL12345',
        status: 'AVAILABLE',
        tenantId: 'test-tenant-id',
      });

      const response = await request(app.getHttpServer())
        .post('/drivers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          email: 'john@test.com',
          phone: '555-0100',
          licenseNumber: 'DL12345',
        })
        .expect(201);

      expect(response.body.name).toBe('John Doe');
    });
  });
});
