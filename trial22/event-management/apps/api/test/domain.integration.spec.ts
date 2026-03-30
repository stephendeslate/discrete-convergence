import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetMocks, mockPrisma } from './helpers/test-app';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Domain CRUD Integration (E2E)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const result = await createTestApp();
    app = result.app;

    const jwtService = app.get(JwtService);
    token = jwtService.sign({
      sub: 'user-1',
      email: 'admin@test.com',
      tenantId: 'tenant-1',
      role: 'ADMIN',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetMocks(mockPrisma);
  });

  describe('Events CRUD', () => {
    it('GET /events should return paginated events', async () => {
      mockPrisma.event.findMany.mockResolvedValue([{ id: 'e1', title: 'Conf' }]);
      mockPrisma.event.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.total).toBe(1);
    });

    it('POST /events should create an event', async () => {
      mockPrisma.event.create.mockResolvedValue({
        id: 'e1',
        title: 'New Event',
        tenantId: 'tenant-1',
      });

      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Event', startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-02T00:00:00Z' })
        .expect(201);

      expect(response.body.id).toBe('e1');
      expect(response.body.title).toBe('New Event');
    });

    it('GET /events should return 401 without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Venues CRUD', () => {
    it('GET /venues should return paginated venues', async () => {
      mockPrisma.venue.findMany.mockResolvedValue([{ id: 'v1', name: 'Hall A' }]);
      mockPrisma.venue.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.total).toBe(1);
    });

    it('POST /venues should create a venue', async () => {
      mockPrisma.venue.create.mockResolvedValue({
        id: 'v1',
        name: 'Conference Hall',
        tenantId: 'tenant-1',
      });

      const response = await request(app.getHttpServer())
        .post('/venues')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Conference Hall', address: '123 Main St', city: 'New York', capacity: 500 })
        .expect(201);

      expect(response.body.id).toBe('v1');
    });
  });

  describe('Sponsors CRUD', () => {
    it('GET /sponsors should return paginated sponsors', async () => {
      mockPrisma.sponsor.findMany.mockResolvedValue([{ id: 's1', name: 'Acme' }]);
      mockPrisma.sponsor.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/sponsors')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('Categories CRUD', () => {
    it('GET /categories should return paginated categories', async () => {
      mockPrisma.category.findMany.mockResolvedValue([{ id: 'c1', name: 'Tech' }]);
      mockPrisma.category.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });
});
