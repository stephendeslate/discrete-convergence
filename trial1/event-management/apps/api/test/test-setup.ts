// TRACED:EM-TEST-001 — Shared integration test setup to reduce boilerplate
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

export async function createTestApp(options?: { withValidation?: boolean }): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  if (options?.withValidation) {
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  }
  await app.init();
  return app;
}
