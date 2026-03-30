import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma.service';

// Set required env vars for test context
process.env['JWT_SECRET'] = 'test-jwt-secret-for-integration-tests';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';

function createMockPrismaService() {
  return {
    $connect: async () => {},
    $disconnect: async () => {},
    $executeRaw: async () => 0,
    user: {
      findFirst: async () => null,
      findMany: async () => [],
      create: async (args: { data: { email: string; passwordHash: string; role: string; tenantId: string } }) => ({
        id: 'mock-user-id',
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        role: args.data.role,
        tenantId: args.data.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    vehicle: { findFirst: async () => null, findMany: async () => [], create: async () => ({}), count: async () => 0 },
    driver: { findFirst: async () => null, findMany: async () => [], create: async () => ({}), count: async () => 0 },
    route: { findFirst: async () => null, findMany: async () => [], create: async () => ({}), count: async () => 0 },
    dispatch: { findFirst: async () => null, findMany: async () => [], create: async () => ({}), count: async () => 0 },
    maintenanceRecord: { findFirst: async () => null, findMany: async () => [], create: async () => ({}), count: async () => 0 },
  };
}

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(createMockPrismaService())
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  return app;
}

export function useTestApp(): { getApp: () => INestApplication } {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  return { getApp: () => app };
}
