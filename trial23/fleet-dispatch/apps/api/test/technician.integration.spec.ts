import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  createTestApp,
  generateToken,
  PrismaMock,
  TEST_USER,
} from './helpers/test-app';

describe('Technician Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaMock;
  let token: string;

  const mockTechnician = {
    id: 'tech-001',
    name: 'John Tech',
    email: 'john@tech.com',
    phone: '+1-555-0101',
    specialty: 'HVAC',
    status: 'AVAILABLE',
    companyId: 'company-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    module = ctx.module;
    prisma = ctx.prisma;
    token = generateToken(module, TEST_USER);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /technicians', () => {
    it('should create a technician with valid data', async () => {
      prisma.technician.create.mockResolvedValue(mockTechnician);

      const res = await request(app.getHttpServer())
        .post('/technicians')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Tech',
          email: 'john@tech.com',
          phone: '+1-555-0101',
          specialty: 'HVAC',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'tech-001');
      expect(res.body).toHaveProperty('name', 'John Tech');
    });

    it('should return 400 for missing required name', async () => {
      await request(app.getHttpServer())
        .post('/technicians')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'noname@tech.com' })
        .expect(400);
    });
  });

  describe('GET /technicians', () => {
    it('should return paginated list of technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([mockTechnician]);
      prisma.technician.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/technicians')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /technicians/:id', () => {
    it('should return a single technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);

      const res = await request(app.getHttpServer())
        .get('/technicians/tech-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', 'tech-001');
      expect(res.body).toHaveProperty('specialty', 'HVAC');
    });
  });

  describe('PUT /technicians/:id', () => {
    it('should update a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);
      prisma.technician.update.mockResolvedValue({
        ...mockTechnician,
        specialty: 'Plumbing',
      });

      const res = await request(app.getHttpServer())
        .put('/technicians/tech-001')
        .set('Authorization', `Bearer ${token}`)
        .send({ specialty: 'Plumbing' })
        .expect(200);

      expect(res.body).toHaveProperty('specialty', 'Plumbing');
    });
  });

  describe('DELETE /technicians/:id', () => {
    it('should delete a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(mockTechnician);
      prisma.technician.delete.mockResolvedValue(mockTechnician);

      await request(app.getHttpServer())
        .delete('/technicians/tech-001')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 for non-existent technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/technicians/nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Authentication', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/technicians')
        .expect(401);
    });

    it('should include response time header', async () => {
      prisma.technician.findMany.mockResolvedValue([]);
      prisma.technician.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/technicians')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.headers['x-response-time']).toMatch(/^\d+ms$/);
    });
  });
});
