import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

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
    }),
  );
  await app.init();
  return app;
}

let userCounter = 0;

export function uniqueEmail(): string {
  userCounter += 1;
  return `test-${Date.now()}-${userCounter}@test.com`;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export async function registerAndLogin(
  app: INestApplication,
  overrides?: { email?: string; password?: string; name?: string; role?: string },
): Promise<AuthTokens & { email: string }> {
  const request = (await import('supertest')).default;
  const email = overrides?.email ?? uniqueEmail();
  const password = overrides?.password ?? 'Password123!';
  const name = overrides?.name ?? 'Test User';
  const role = overrides?.role ?? 'viewer';

  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password, name, role });

  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  return {
    access_token: loginRes.body.access_token,
    refresh_token: loginRes.body.refresh_token,
    email,
  };
}
