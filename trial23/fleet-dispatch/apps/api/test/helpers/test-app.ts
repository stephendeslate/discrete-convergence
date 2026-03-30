import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infra/prisma.service';
import { JwtService } from '@nestjs/jwt';
import helmet from 'helmet';

function createPrismaMock() {
  const modelMethods = {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    findUniqueOrThrow: jest.fn().mockRejectedValue(new Error('Not found')),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
    upsert: jest.fn().mockResolvedValue({}),
  };

  return {
    user: { ...modelMethods },
    workOrder: { ...modelMethods },
    technician: { ...modelMethods },
    customer: { ...modelMethods },
    route: { ...modelMethods },
    routeStop: { ...modelMethods },
    dashboard: { ...modelMethods },
    dataSource: { ...modelMethods },
    notification: { ...modelMethods },
    auditLog: { ...modelMethods },
    invoice: { ...modelMethods },
    lineItem: { ...modelMethods },
    widget: { ...modelMethods },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(1),
    $transaction: jest.fn().mockImplementation((fn: (prisma: unknown) => unknown) => fn(this)),
    setTenantContext: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue(true),
    onModuleInit: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  };
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;

export async function createTestApp(): Promise<{
  app: INestApplication;
  module: TestingModule;
  prisma: PrismaMock;
}> {
  const prismaMock = createPrismaMock();

  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .compile();

  const app = module.createNestApplication();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, module, prisma: prismaMock };
}

export function generateToken(
  module: TestingModule,
  payload: { sub: string; email: string; role: string; companyId: string },
): string {
  const jwtService = module.get(JwtService);
  return jwtService.sign(payload);
}

export const TEST_USER = {
  sub: 'user-001',
  email: 'admin@test.com',
  role: 'ADMIN',
  companyId: 'company-001',
};

export const TEST_DISPATCHER = {
  sub: 'user-002',
  email: 'dispatcher@test.com',
  role: 'DISPATCHER',
  companyId: 'company-001',
};

export const TEST_TECHNICIAN_USER = {
  sub: 'user-003',
  email: 'tech@test.com',
  role: 'TECHNICIAN',
  companyId: 'company-001',
};

export const TEST_CUSTOMER_USER = {
  sub: 'user-004',
  email: 'customer@test.com',
  role: 'CUSTOMER',
  companyId: 'company-001',
};
