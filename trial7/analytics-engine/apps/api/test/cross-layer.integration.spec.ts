import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import { APP_VERSION } from '@analytics-engine/shared';
import { Server } from 'http';

// TRACED:AE-TEST-010
describe('Cross-Layer Integration (e2e)', () => {
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

  it('should have full pipeline: auth -> CRUD -> error handling -> correlation ID -> response time', async () => {
    // Auth check
    await request(server).get('/dashboards').expect(401);

    // Successful CRUD
    prisma.dashboard.findMany.mockResolvedValue([]);
    prisma.dashboard.count.mockResolvedValue(0);

    const res = await request(server)
      .get('/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Correlation-ID', 'test-corr-id')
      .expect(200);

    // Response time header
    expect(res.headers['x-response-time']).toBeDefined();

    // Error handling with correlation ID
    const errorRes = await request(server)
      .get('/nonexistent-path')
      .set('X-Correlation-ID', 'error-corr-id')
      .expect(404);

    expect(errorRes.body).toHaveProperty('correlationId');
    expect(errorRes.body).not.toHaveProperty('stack');
  });

  it('should serve health endpoint with APP_VERSION from shared', async () => {
    const res = await request(server).get('/health').expect(200);

    expect(res.body.version).toBe(APP_VERSION);
    expect(res.body.status).toBe('ok');
  });

  it('should verify DB connectivity through readiness endpoint', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(server).get('/health/ready').expect(200);
    expect(res.body.database).toBe('connected');
  });

  it('should enforce RBAC through global guard chain', async () => {
    // USER role trying to delete dashboard (requires ADMIN)
    await request(server)
      .delete('/dashboards/some-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('should validate DTOs through global ValidationPipe', async () => {
    await request(server)
      .post('/auth/register')
      .send({ email: 'invalid' })
      .expect(400);
  });
});
