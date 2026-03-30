import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import { Server } from 'http';

// TRACED:AE-TEST-009
describe('Performance Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let server: Server;
  let token: string;

  beforeAll(async () => {
    prisma = createMockPrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
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
    server = app.getHttpServer() as Server;

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      tenantId: 'tenant-1',
    });

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      tenantId: 'tenant-1',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include X-Response-Time header', async () => {
    const res = await request(server).get('/health').expect(200);
    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
  });

  it('should include Cache-Control on list endpoints', async () => {
    prisma.dashboard.findMany.mockResolvedValue([]);
    prisma.dashboard.count.mockResolvedValue(0);

    const res = await request(server)
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.headers['cache-control']).toBeDefined();
  });

  it('should clamp pageSize to MAX_PAGE_SIZE', async () => {
    prisma.dashboard.findMany.mockResolvedValue([]);
    prisma.dashboard.count.mockResolvedValue(0);

    const res = await request(server)
      .get('/dashboards?page=1&pageSize=999')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.pageSize).toBe(100);
  });

  it('should default page to 1 and pageSize to 20', async () => {
    prisma.dashboard.findMany.mockResolvedValue([]);
    prisma.dashboard.count.mockResolvedValue(0);

    const res = await request(server)
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(20);
  });
});
