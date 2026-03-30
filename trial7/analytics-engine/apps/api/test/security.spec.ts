import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import { Server } from 'http';

// TRACED:AE-TEST-008
describe('Security Integration (e2e)', () => {
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

  it('should return 401 for protected endpoints without token', async () => {
    await request(server).get('/dashboards').expect(401);
    await request(server).get('/widgets').expect(401);
    await request(server).get('/data-sources').expect(401);
    await request(server).get('/audit-logs').expect(401);
  });

  it('should return 401 for invalid JWT token', async () => {
    await request(server)
      .get('/dashboards')
      .set('Authorization', 'Bearer invalid-token-here')
      .expect(401);
  });

  it('should return 401 for expired token', async () => {
    // Token with an invalid signature
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsInRlbmFudElkIjoidGVuYW50LTEiLCJpYXQiOjEwMDAwMDAwMDAsImV4cCI6MTAwMDAwMDAwMX0.invalid-signature';
    await request(server)
      .get('/dashboards')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should reject requests with extra fields (forbidNonWhitelisted)', async () => {
    await request(server)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'pass123',
        name: 'Test',
        tenantId: 'tenant-1',
        role: 'USER',
        hackerField: 'should-be-rejected',
      })
      .expect(400);
  });

  it('should not expose stack traces in error responses', async () => {
    const res = await request(server).get('/nonexistent').expect(404);

    expect(res.body).not.toHaveProperty('stack');
    expect(res.body).toHaveProperty('statusCode', 404);
    expect(res.body).toHaveProperty('correlationId');
  });

  it('should allow public endpoints without auth', async () => {
    await request(server).get('/health').expect(200);
    await request(server).get('/metrics').expect(200);
  });
});
