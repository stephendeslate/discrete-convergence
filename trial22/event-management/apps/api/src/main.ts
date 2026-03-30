import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@repo/shared';

// TRACED: EM-SEC-004
// TRACED: EM-SEC-005
// TRACED: EM-SEC-006
// TRACED: EM-SEC-007
async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET']);

  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
