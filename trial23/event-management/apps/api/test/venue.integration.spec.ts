import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers/test-app';

describe('Venue Integration', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof import('./helpers/test-app')['buildMockPrismaService']>['prisma'];
  let token: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    token = generateTestToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.venue.findFirst.mockResolvedValue({
      id: 'venue-uuid-001',
      name: 'Test Venue',
      address: '123 Main St',
      capacity: 500,
      organizationId: 'org-uuid-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.venue.findMany.mockResolvedValue([
      {
        id: 'venue-uuid-001',
        name: 'Test Venue',
        address: '123 Main St',
        capacity: 500,
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.venue.count.mockResolvedValue(1);
  });

  function authGet(path: string) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function authPost(path: string) {
    return request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function authPatch(path: string) {
    return request(app.getHttpServer())
      .patch(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function authDelete(path: string) {
    return request(app.getHttpServer())
      .delete(path)
      .set('Authorization', `Bearer ${token}`);
  }

  describe('POST /venues', () => {
    it('should create a venue', async () => {
      prisma.venue.create.mockResolvedValueOnce({
        id: 'venue-new-001',
        name: 'Grand Ballroom',
        address: '456 Elm St',
        capacity: 300,
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authPost('/venues')
        .send({ name: 'Grand Ballroom', address: '456 Elm St', capacity: 300 })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Grand Ballroom');
      expect(res.body.capacity).toBe(300);
    });

    it('should reject venue with invalid data (missing capacity) with 400', async () => {
      const res = await authPost('/venues')
        .send({ name: 'No Capacity Venue' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('GET /venues', () => {
    it('should return paginated list of venues', async () => {
      const res = await authGet('/venues').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /venues/:id', () => {
    it('should return a single venue', async () => {
      const res = await authGet('/venues/venue-uuid-001').expect(200);

      expect(res.body.id).toBe('venue-uuid-001');
      expect(res.body.name).toBe('Test Venue');
    });

    it('should return 404 for non-existent venue', async () => {
      prisma.venue.findFirst.mockResolvedValueOnce(null);

      const res = await authGet('/venues/00000000-0000-0000-0000-000000000000').expect(404);

      expect(res.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /venues/:id', () => {
    it('should update venue', async () => {
      prisma.venue.update.mockResolvedValueOnce({
        id: 'venue-uuid-001',
        name: 'Updated Venue',
        address: '123 Main St',
        capacity: 500,
        organizationId: 'org-uuid-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await authPatch('/venues/venue-uuid-001')
        .send({ name: 'Updated Venue' })
        .expect(200);

      expect(res.body.name).toBe('Updated Venue');
    });
  });

  describe('DELETE /venues/:id', () => {
    it('should remove venue', async () => {
      prisma.venue.delete.mockResolvedValueOnce({
        id: 'venue-uuid-001',
        name: 'Test Venue',
        organizationId: 'org-uuid-001',
      });

      await authDelete('/venues/venue-uuid-001').expect(200);

      expect(prisma.venue.delete).toHaveBeenCalled();
    });
  });
});
