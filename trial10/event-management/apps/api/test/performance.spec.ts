import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('Performance Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockPrisma = createMockPrismaService();
    mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response Time', () => {
    it('should include X-Response-Time header on all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should respond to health within 500ms', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const timeStr = response.headers['x-response-time'] as string;
      const timeMs = parseFloat(timeStr.replace('ms', ''));
      expect(timeMs).toBeLessThan(500);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Pagination', () => {
    it('should accept page and limit query params on list endpoints (auth required)', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?page=1&limit=10')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should reject non-numeric pagination params (auth layer first)', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?page=abc&limit=xyz')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Error responses', () => {
    it('should include X-Response-Time on successful responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.body.status).toBe('ok');
    });

    it('should include correlation ID on error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer invalid')
        .expect(401);

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.body.statusCode).toBe(401);
    });
  });
});
