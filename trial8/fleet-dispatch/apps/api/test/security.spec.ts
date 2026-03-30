import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken } from './helpers/test-utils';

describe('Security (FD-SEC)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    vehicle: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    driver: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    route: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    trip: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    maintenance: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
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
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED: FD-SEC-001
  it('should reject requests without authorization', async () => {
    const res = await request(app.getHttpServer()).get('/vehicles');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-SEC-002
  it('should reject USER role from deleting vehicles', async () => {
    const userToken = createTestToken(jwtService, { role: 'USER' });
    const res = await request(app.getHttpServer())
      .delete('/vehicles/some-id')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-SEC-003
  it('should reject USER role from deleting drivers', async () => {
    const userToken = createTestToken(jwtService, { role: 'USER' });
    const res = await request(app.getHttpServer())
      .delete('/drivers/some-id')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-SEC-004
  it('should reject USER role from deleting routes', async () => {
    const userToken = createTestToken(jwtService, { role: 'USER' });
    const res = await request(app.getHttpServer())
      .delete('/routes/some-id')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-SEC-005
  it('should reject USER role from creating vehicles', async () => {
    const userToken = createTestToken(jwtService, { role: 'USER' });
    const res = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ vin: 'VIN1', make: 'Ford', model: 'Transit', year: 2023 });
    expect(res.status).toBe(403);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-SEC-006
  it('should strip unknown properties via whitelist', async () => {
    const token = createTestToken(jwtService);
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'password123', hack: 'data' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // TRACED: FD-SEC-007
  it('should include correlation-id in response', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBeDefined();
  });
});
