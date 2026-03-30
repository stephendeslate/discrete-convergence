import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, generateTestToken, MockPrismaService } from './helpers/test-utils';

describe('Dispatch Integration (e2e)', () => {
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

  describe('GET /dispatches', () => {
    it('should return paginated dispatches', async () => {
      prisma.dispatch.findMany.mockResolvedValue([]);
      prisma.dispatch.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/dispatches')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /dispatches', () => {
    it('should reject invalid dispatch data', async () => {
      await request(app.getHttpServer())
        .post('/dispatches')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });
  });
});
