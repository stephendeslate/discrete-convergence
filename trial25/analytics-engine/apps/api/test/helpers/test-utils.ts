// TRACED:TEST-UTILS — Test utility helpers
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

// Set required env vars for integration tests
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-jwt-secret-for-integration-tests';
process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://test:test@localhost:5432/test';

/**
 * Creates a NestJS test application with the same configuration as production.
 * TRACED:AE-TEST-001 — Test application factory
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();
  return app;
}

/**
 * Generates a mock JWT payload for testing.
 * TRACED:AE-TEST-002 — Mock JWT payload
 */
export function createMockJwtPayload(overrides?: Partial<{
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}>): { sub: string; email: string; tenantId: string; role: string } {
  return {
    sub: 'test-user-id',
    email: 'test@test.com',
    tenantId: 'test-tenant',
    role: 'ADMIN',
    ...overrides,
  };
}

/**
 * Helper to create auth header.
 */
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
