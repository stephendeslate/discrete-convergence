// Re-exports for backward compatibility with existing test files
export { createTestApp as createTestAppWithMocks, uniqueEmail, generateTestToken } from './test-app';

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://testuser:testpass@localhost:5433/testdb';
process.env.JWT_SECRET = 'test-jwt-secret-for-integration';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import request from 'supertest';

let counter = 0;

export async function createTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

export function uniqueEmail(): string {
  counter += 1;
  return `test-${Date.now()}-${counter}@example.com`;
}

export async function registerAndLogin(
  app: INestApplication,
  overrides?: { email?: string; password?: string; name?: string; role?: string },
): Promise<{ access_token: string; refresh_token: string }> {
  const email = overrides?.email ?? uniqueEmail();
  const password = overrides?.password ?? 'TestPassword123!';
  const name = overrides?.name ?? 'Test User';
  const role = overrides?.role ?? 'ORGANIZER';

  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password, name, role })
    .expect(201);

  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return {
    access_token: loginRes.body.access_token,
    refresh_token: loginRes.body.refresh_token,
  };
}
