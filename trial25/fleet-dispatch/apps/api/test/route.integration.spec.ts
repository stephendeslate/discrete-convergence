import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, generateTestToken, MockPrismaService } from './helpers/test-utils';

describe('Route Integration (e2e)', () => {
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

  describe('GET /routes', () => {
    it('should return paginated routes', async () => {
      prisma.route.findMany.mockResolvedValue([]);
      prisma.route.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/routes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /routes', () => {
    it('should create a route', async () => {
      prisma.route.create.mockResolvedValue({
        id: 'r-1',
        name: 'Route A',
        origin: 'City A',
        destination: 'City B',
        distance: 100,
        estimatedDuration: 120,
        tenantId: 'test-tenant-id',
      });

      const response = await request(app.getHttpServer())
        .post('/routes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Route A',
          origin: 'City A',
          destination: 'City B',
          distance: 100,
          estimatedDuration: 120,
        })
        .expect(201);

      expect(response.body.name).toBe('Route A');
    });
  });
});
