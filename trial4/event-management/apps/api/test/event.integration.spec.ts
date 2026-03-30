// TRACED:EM-TEST-002 — event domain integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Event Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env['JWT_SECRET'] = 'test-jwt-secret-for-integration';
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env['CORS_ORIGIN'] = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
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
          startDate: '2026-06-01T10:00:00Z',
          endDate: '2026-06-01T18:00:00Z',
        });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /events/public/discovery', () => {
    it('should be publicly accessible', async () => {
      const res = await request(app.getHttpServer()).get('/events/public/discovery');
      expect([200, 500]).toContain(res.status);
    });
  });
});
