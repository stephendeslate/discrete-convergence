import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';

describe('Vehicle Integration', () => {
  let app: INestApplication;
  let prismaService: {
    vehicle: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock };
    user: { findFirst: jest.Mock; findUnique: jest.Mock; create: jest.Mock };
    $connect: jest.Mock; $disconnect: jest.Mock; $queryRaw: jest.Mock; $on: jest.Mock; $executeRaw: jest.Mock;
  };

  beforeAll(async () => {
    prismaService = {
      vehicle: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
      $on: jest.fn(),
      $executeRaw: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /vehicles', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/vehicles');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('POST /vehicles', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .send({ licensePlate: 'FD-001', make: 'Ford', model: 'Transit', year: 2023, capacity: 2500 });

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });

    it('should return 401 with expired token', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', 'Bearer expired.token.here')
        .send({ licensePlate: 'FD-001', make: 'Ford', model: 'Transit', year: 2023, capacity: 2500 });

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/vehicles/some-id');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('PUT /vehicles/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .put('/vehicles/some-id')
        .send({ make: 'Toyota' });

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).delete('/vehicles/some-id');

      expect(res.status).toBe(401);
      expect(res.body.statusCode).toBe(401);
    });
  });
});
