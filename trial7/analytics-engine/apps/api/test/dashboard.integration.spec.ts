import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import { Server } from 'http';

// TRACED:AE-TEST-006
describe('Dashboard Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let jwtService: JwtService;
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
    jwtService = moduleFixture.get<JwtService>(JwtService);
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

  it('should create a dashboard', async () => {
    prisma.dashboard.create.mockResolvedValue({
      id: 'dash-1',
      title: 'New Dashboard',
      status: 'DRAFT',
      tenantId: 'tenant-1',
      widgets: [],
    });

    const res = await request(server)
      .post('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Dashboard' })
      .expect(201);

    expect(res.body.title).toBe('New Dashboard');
  });

  it('should return 401 without auth token', async () => {
    await request(server)
      .get('/dashboards')
      .expect(401);
  });

  it('should list dashboards', async () => {
    prisma.dashboard.findMany.mockResolvedValue([]);
    prisma.dashboard.count.mockResolvedValue(0);

    const res = await request(server)
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.headers['cache-control']).toContain('max-age');
  });

  it('should return 404 for non-existent dashboard', async () => {
    prisma.dashboard.findUnique.mockResolvedValue(null);

    await request(server)
      .get('/dashboards/non-existent-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should return 403 when non-admin tries to delete', async () => {
    // User role is USER, delete requires ADMIN role
    await request(server)
      .delete('/dashboards/dash-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
