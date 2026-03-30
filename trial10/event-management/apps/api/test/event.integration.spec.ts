import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('Event Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockPrisma = createMockPrismaService();
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

  describe('POST /events', () => {
    it('should reject unauthenticated event creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({ title: 'Test', startDate: '2025-06-01', endDate: '2025-06-02' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('GET /events', () => {
    it('should reject unauthenticated list request', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('POST /venues', () => {
    it('should reject unauthenticated venue creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/venues')
        .send({ name: 'Test Venue', address: '123 St', capacity: 100 })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('POST /tickets', () => {
    it('should reject unauthenticated ticket creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets')
        .send({ name: 'GA', price: 50, quantity: 100, eventId: 'ev-1' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('POST /registrations', () => {
    it('should reject unauthenticated registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/registrations')
        .send({ eventId: 'ev-1', userId: 'u-1' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });
});
