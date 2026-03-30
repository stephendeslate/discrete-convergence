import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED:EM-TEST-002 — Event integration tests with supertest

describe('Event Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    await app.close();
  });

  describe('GET /events', () => {
    it('should require authentication', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /events', () => {
    it('should require authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .send({
          title: 'Test Event',
          slug: 'test-event',
          startDate: '2026-06-01T00:00:00Z',
          endDate: '2026-06-02T00:00:00Z',
        });
      expect(res.status).toBe(401);
    });

    it('should reject invalid event data without auth', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /events/:id', () => {
    it('should require authentication', async () => {
      const res = await request(app.getHttpServer()).get(
        '/events/00000000-0000-0000-0000-000000000000',
      );
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /events/:id/publish', () => {
    it('should require authentication', async () => {
      const res = await request(app.getHttpServer()).patch(
        '/events/00000000-0000-0000-0000-000000000000/publish',
      );
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /events/:id/cancel', () => {
    it('should require authentication', async () => {
      const res = await request(app.getHttpServer()).patch(
        '/events/00000000-0000-0000-0000-000000000000/cancel',
      );
      expect(res.status).toBe(401);
    });
  });
});
