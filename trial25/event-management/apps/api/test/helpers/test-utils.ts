import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infra/prisma.service';

export interface TestApp {
  app: INestApplication;
  prisma: Record<string, unknown>;
}

export function createMockPrisma(): Record<string, unknown> {
  const mockModel = {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 'test-id' }),
    update: jest.fn().mockResolvedValue({ id: 'test-id' }),
    delete: jest.fn().mockResolvedValue({ id: 'test-id' }),
    count: jest.fn().mockResolvedValue(0),
  };

  return {
    user: { ...mockModel },
    event: { ...mockModel },
    venue: { ...mockModel },
    ticket: { ...mockModel },
    attendee: { ...mockModel },
    speaker: { ...mockModel },
    session: { ...mockModel },
    sponsor: { ...mockModel },
    auditLog: { ...mockModel },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(1),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    setTenantContext: jest.fn(),
  };
}

export async function createTestApp(): Promise<TestApp> {
  const mockPrisma = createMockPrisma();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  return { app, prisma: mockPrisma };
}
