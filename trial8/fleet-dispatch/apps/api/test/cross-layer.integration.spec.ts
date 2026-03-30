import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken } from './helpers/test-utils';
import { APP_VERSION } from '@fleet-dispatch/shared';

describe('Cross-Layer Integration (FD-XL)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    vehicle: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    driver: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null) },
    route: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null) },
    trip: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null) },
    maintenance: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null) },
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

  // TRACED: FD-XL-001
  it('should enforce auth globally - no @UseGuards on controllers', async () => {
    const res = await request(app.getHttpServer()).get('/drivers');
    expect(res.status).toBe(401);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-XL-002
  it('should pass full pipeline: auth + role + response time', async () => {
    const token = createTestToken(jwtService);
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });

  // TRACED: FD-XL-003
  it('should include APP_VERSION from shared in health', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(APP_VERSION);
  });

  // TRACED: FD-XL-004
  it('should enforce RBAC via global RolesGuard', async () => {
    const userToken = createTestToken(jwtService, { role: 'USER' });
    const res = await request(app.getHttpServer())
      .delete('/trips/some-id')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toBeDefined();
  });

  // TRACED: FD-XL-005
  it('should include correlation-id header across the stack', async () => {
    const token = createTestToken(jwtService);
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .set('x-correlation-id', 'test-corr-id');
    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBe('test-corr-id');
  });

  // TRACED: FD-XL-006
  it('should return X-Response-Time on health endpoint too', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });
});
