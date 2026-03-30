import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createTestToken } from './helpers/test-utils';
import { clampPagination, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';

describe('Performance (FD-PERF)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  const mockPrisma = {
    vehicle: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    driver: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    route: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    trip: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    maintenance: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
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
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    token = createTestToken(jwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED: FD-PERF-001
  it('should include X-Response-Time header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });

  // TRACED: FD-PERF-002
  it('should include Cache-Control on list endpoints', async () => {
    const res = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('private');
  });

  // TRACED: FD-PERF-003
  it('should clamp page size to MAX_PAGE_SIZE', () => {
    const result = clampPagination(1, 500);
    expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    expect(result.take).toBe(MAX_PAGE_SIZE);
  });

  // TRACED: FD-PERF-004
  it('should use DEFAULT_PAGE_SIZE when not specified', () => {
    const result = clampPagination();
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.page).toBe(1);
  });

  // TRACED: FD-PERF-005
  it('should clamp negative page to 1', () => {
    const result = clampPagination(-5, 10);
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });
});
