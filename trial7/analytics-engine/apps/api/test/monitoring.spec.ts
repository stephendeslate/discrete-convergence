import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import { Server } from 'http';

// TRACED:AE-TEST-007
describe('Monitoring Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let server: Server;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health status without auth', async () => {
    const res = await request(server).get('/health').expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('version');
  });

  it('should return readiness with DB check', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(server).get('/health/ready').expect(200);

    expect(res.body).toHaveProperty('status', 'ready');
    expect(res.body).toHaveProperty('database', 'connected');
  });

  it('should return not_ready when DB is down', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(server).get('/health/ready').expect(200);

    expect(res.body).toHaveProperty('status', 'not_ready');
    expect(res.body).toHaveProperty('database', 'disconnected');
  });

  it('should return metrics without auth', async () => {
    const res = await request(server).get('/metrics').expect(200);

    expect(res.body).toHaveProperty('requestCount');
    expect(res.body).toHaveProperty('errorCount');
    expect(res.body).toHaveProperty('avgResponseTime');
    expect(res.body).toHaveProperty('uptime');
  });

  it('should accept error reports', async () => {
    const res = await request(server)
      .post('/errors')
      .send({ message: 'Test error', url: '/test' })
      .expect(201);

    expect(res.body).toHaveProperty('received', true);
  });

  it('should include X-Response-Time header', async () => {
    const res = await request(server).get('/health').expect(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('should include correlation ID in response on error', async () => {
    const res = await request(server)
      .get('/nonexistent-route')
      .set('X-Correlation-ID', 'test-corr-123')
      .expect(404);

    expect(res.body).toHaveProperty('correlationId');
  });
});
