import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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

  describe('POST /events', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({
          title: 'Test Event',
          slug: 'test-event',
          timezone: 'UTC',
          startDate: '2026-06-15T09:00:00Z',
          endDate: '2026-06-15T17:00:00Z',
          capacity: 100,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /events', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/events');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /events/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/events/00000000-0000-0000-0000-000000000001',
      );
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /events/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch('/events/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /events/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/events/00000000-0000-0000-0000-000000000001',
      );
      expect(response.status).toBe(401);
    });
  });
});
