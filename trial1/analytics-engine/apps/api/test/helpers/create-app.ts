import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

export async function createTestApp(options?: { validation?: boolean }): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  if (options?.validation) {
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  }
  await app.init();
  return app;
}

export function useTestApp(options?: { validation?: boolean }): { getApp: () => INestApplication } {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp(options);
  });

  afterAll(async () => {
    await app.close();
  });

  return { getApp: () => app };
}
