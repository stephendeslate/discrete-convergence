import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken } from './helpers/test-utils';

describe('Vehicle Integration (FD-VEH)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  const mockPrisma = {
    vehicle: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'v1', vin: 'VIN1', make: 'Ford', model: 'Transit', year: 2023, status: 'ACTIVE', mileage: 0, tenantId: 'test-tenant-id' }),
      update: jest.fn().mockResolvedValue({ id: 'v1' }),
      delete: jest.fn().mockResolvedValue({ id: 'v1' }),
      count: jest.fn().mockResolvedValue(0),
    },
    user: { findFirst: jest.fn(), create: jest.fn() },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(0),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

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
    token = createTestToken(jwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED: FD-VEH-001
  it('should list vehicles with auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  // TRACED: FD-VEH-002
  it('should reject vehicle creation with invalid VIN', async () => {
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ vin: '', make: 'Ford', model: 'Transit', year: 2023 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // TRACED: FD-VEH-003
  it('should reject vehicle creation with extra fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ vin: 'VIN123', make: 'Ford', model: 'Transit', year: 2023, hackerField: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // TRACED: FD-VEH-004
  it('should reject vehicle without auth', async () => {
    const res = await request(app.getHttpServer()).get('/vehicles');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-VEH-005
  it('should reject with wrong role for delete', async () => {
    const userToken = createTestToken(jwtService, { role: 'USER' });
    const res = await request(app.getHttpServer())
      .delete('/vehicles/some-id')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-VEH-006
  it('should reject vehicle creation with missing required fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ vin: 'VIN123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});
