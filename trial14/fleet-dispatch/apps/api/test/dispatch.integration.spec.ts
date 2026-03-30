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

describe('Dispatch Integration', () => {
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

  describe('GET /dispatches', () => {
    it('should reject unauthenticated access', async () => {
      const response = await request(app.getHttpServer()).get('/dispatches');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/dispatches')
        .set('Authorization', 'Bearer invalid');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('POST /dispatches', () => {
    it('should reject unauthenticated dispatch creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/dispatches')
        .send({ title: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });

    it('should reject empty dispatch creation with token', async () => {
      const response = await request(app.getHttpServer())
        .post('/dispatches')
        .set('Authorization', 'Bearer invalid-token')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('GET /dispatches/:id', () => {
    it('should reject unauthenticated access to single dispatch', async () => {
      const response = await request(app.getHttpServer()).get(
        '/dispatches/some-id',
      );

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('PUT /dispatches/:id', () => {
    it('should reject unauthenticated dispatch update', async () => {
      const response = await request(app.getHttpServer())
        .put('/dispatches/some-id')
        .send({ title: 'Updated' });

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('DELETE /dispatches/:id', () => {
    it('should reject unauthenticated dispatch deletion', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/dispatches/some-id',
      );

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('GET /vehicles', () => {
    it('should reject unauthenticated vehicle listing', async () => {
      const response = await request(app.getHttpServer()).get('/vehicles');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('GET /drivers', () => {
    it('should reject unauthenticated driver listing', async () => {
      const response = await request(app.getHttpServer()).get('/drivers');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

  describe('GET /routes', () => {
    it('should reject unauthenticated route listing', async () => {
      const response = await request(app.getHttpServer()).get('/routes');

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
    });
  });
});
