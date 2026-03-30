import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';
import * as bcrypt from 'bcrypt';
import { Server } from 'http';

// TRACED:AE-TEST-005
describe('Auth Integration (e2e)', () => {
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

  it('should register a new user', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      tenantId: 'tenant-1',
    });

    const res = await request(server)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'StrongP@ss1',
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'USER',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
  });

  it('should return 401 for login with invalid credentials', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await request(server)
      .post('/auth/login')
      .send({ email: 'missing@example.com', password: 'wrong' })
      .expect(401);
  });

  it('should return 401 for login with wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct', 10);
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash,
      role: 'USER',
      tenantId: 'tenant-1',
      tenant: { id: 'tenant-1' },
    });

    await request(server)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('should return 401 for protected route without token', async () => {
    await request(server).get('/auth/profile').expect(401);
  });

  it('should return 400 for registration with invalid email', async () => {
    await request(server)
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'StrongP@ss1',
        name: 'Test',
        tenantId: 'tenant-1',
        role: 'USER',
      })
      .expect(400);
  });

  it('should return 400 for registration with ADMIN role', async () => {
    await request(server)
      .post('/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'StrongP@ss1',
        name: 'Hacker',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      })
      .expect(400);
  });

  it('should login successfully with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-pass', 10);
    prisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash,
      role: 'USER',
      tenantId: 'tenant-1',
      tenant: { id: 'tenant-1' },
    });

    const res = await request(server)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'correct-pass' })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
  });
});
