import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('Vehicle Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  const mockPrisma = {
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
  };

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

    jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({
      sub: 'user-1',
      email: 'admin@fleet.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /vehicles', () => {
    it('should create a vehicle', async () => {
      mockPrisma.vehicle.create.mockResolvedValue({
        id: 'v-1',
        name: 'Truck Alpha',
        licensePlate: 'ABC-1234',
        status: 'AVAILABLE',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Truck Alpha', licensePlate: 'ABC-1234' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Truck Alpha');
      expect(mockPrisma.vehicle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
      );
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .send({ name: 'Truck', licensePlate: 'ABC' });

      expect(res.status).toBe(401);
      expect(mockPrisma.vehicle.create).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should reject extra properties with forbidNonWhitelisted', async () => {
      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Truck', licensePlate: 'ABC', hackerField: true });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('GET /vehicles', () => {
    it('should return paginated vehicles', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([
        { id: 'v-1', name: 'Truck', tenantId: 'tenant-1' },
      ]);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        }),
      );
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/vehicles');

      expect(res.status).toBe(401);
      expect(mockPrisma.vehicle.findMany).not.toHaveBeenCalled();
    });

    it('should have X-Response-Time header', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return a vehicle by id', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({
        id: 'v-1',
        name: 'Truck',
        tenantId: 'tenant-1',
        dispatches: [],
      });

      const res = await request(app.getHttpServer())
        .get('/vehicles/v-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('v-1');
      expect(mockPrisma.vehicle.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'v-1', tenantId: 'tenant-1' },
        }),
      );
    });

    it('should return 404 for non-existent vehicle', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/vehicles/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should require ADMIN role', async () => {
      const dispatcherToken = jwtService.sign({
        sub: 'user-2',
        email: 'dispatcher@fleet.com',
        role: 'DISPATCHER',
        tenantId: 'tenant-1',
      });

      const res = await request(app.getHttpServer())
        .delete('/vehicles/v-1')
        .set('Authorization', `Bearer ${dispatcherToken}`);

      expect(res.status).toBe(403);
      expect(mockPrisma.vehicle.delete).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to delete', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({
        id: 'v-1',
        tenantId: 'tenant-1',
        dispatches: [],
      });
      mockPrisma.vehicle.delete.mockResolvedValue({ id: 'v-1' });

      const res = await request(app.getHttpServer())
        .delete('/vehicles/v-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockPrisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 'v-1' } });
    });
  });
});
