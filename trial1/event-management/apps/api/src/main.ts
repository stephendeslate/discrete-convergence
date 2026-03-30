// TRACED:EM-INFRA-004 — Environment validation at startup with validateEnvVars
// TRACED:EM-SEC-001 — Helmet middleware with CSP configuration
// TRACED:EM-SEC-003 — CORS from environment variable
// TRACED:EM-SEC-004 — ValidationPipe with whitelist and forbidNonWhitelisted
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@event-management/shared';

async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CORS_ORIGIN']);

  const app = await NestFactory.create(AppModule);

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
    origin: process.env['CORS_ORIGIN'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
}

bootstrap();
