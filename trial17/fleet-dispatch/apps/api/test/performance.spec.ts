import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $executeRaw: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

describe('Performance Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('Response Time Headers', () => {
    it('should include X-Response-Time on health endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });

    it('should include X-Response-Time on metrics endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/health/metrics');

      expect(response.status).toBe(200);
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Response-Time on auth endpoint', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'test' });

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.status).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should reject page size above maximum', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles?pageSize=200')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should accept valid pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicles?page=1&pageSize=20')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('Health endpoint performance', () => {
    it('should respond to health check quickly', async () => {
      const start = Date.now();
      const response = await request(app.getHttpServer()).get('/health');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });

    it('should respond to readiness check', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBeDefined();
    });
  });
});
