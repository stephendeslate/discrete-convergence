import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('Vehicle Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const mockPrisma = createMockPrismaService();
  const tenantId = 'test-tenant-001';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getToken(role = 'DISPATCHER'): string {
    return jwtService.sign({ sub: 'user-1', email: 'test@fleet.test', role, tenantId });
  }

  describe('POST /vehicles', () => {
    it('should create a vehicle', async () => {
      const vehicle = { id: 'v-1', licensePlate: 'FL-100', make: 'Ford', model: 'Transit', year: 2023, tenantId };
      mockPrisma.vehicle.create.mockResolvedValue(vehicle);

      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${getToken()}`)
        .send({ licensePlate: 'FL-100', make: 'Ford', model: 'Transit', year: 2023, fuelCapacity: 80, costPerMile: 0.45 })
        .expect(201);

      expect(res.body.licensePlate).toBe('FL-100');
      expect(mockPrisma.vehicle.create).toHaveBeenCalled();
    });

    it('should reject invalid vehicle data', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${getToken()}`)
        .send({ licensePlate: '' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(mockPrisma.vehicle.create).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .send({ licensePlate: 'FL-100', make: 'Ford', model: 'Transit', year: 2023, fuelCapacity: 80, costPerMile: 0.45 })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('GET /vehicles', () => {
    it('should return vehicles list', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([{ id: 'v-1', tenantId }]);
      mockPrisma.vehicle.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.total).toBe(1);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalled();
    });

    it('should include Cache-Control header', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      mockPrisma.vehicle.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.headers['cache-control']).toContain('max-age');
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return a single vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v-1', tenantId, make: 'Ford' });

      const res = await request(app.getHttpServer())
        .get('/vehicles/v-1')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(200);

      expect(res.body.make).toBe('Ford');
      expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'v-1' } }),
      );
    });

    it('should return 404 for nonexistent vehicle', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/vehicles/nonexistent')
        .set('Authorization', `Bearer ${getToken()}`)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should reject non-admin delete', async () => {
      const res = await request(app.getHttpServer())
        .delete('/vehicles/v-1')
        .set('Authorization', `Bearer ${getToken('DRIVER')}`)
        .expect(403);

      expect(res.body.statusCode).toBe(403);
    });

    it('should allow admin delete', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v-1', tenantId });
      mockPrisma.vehicle.delete.mockResolvedValue({ id: 'v-1' });

      await request(app.getHttpServer())
        .delete('/vehicles/v-1')
        .set('Authorization', `Bearer ${getToken('ADMIN')}`)
        .expect(200);

      expect(mockPrisma.vehicle.delete).toHaveBeenCalled();
    });
  });
});
