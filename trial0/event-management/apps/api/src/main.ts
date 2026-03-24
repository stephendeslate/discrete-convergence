// TRACED:EM-MAIN-001 — Application bootstrap with env validation and security
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@event-management/shared';

async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'CORS_ORIGIN', 'PORT']);

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // TRACED:EM-SEC-001 — Helmet CSP configuration
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

  // TRACED:EM-SEC-002 — CORS from env, no fallback
  app.enableCors({
    origin: process.env['CORS_ORIGIN'],
    credentials: true,
  });

  // TRACED:EM-SEC-003 — Validation pipe with whitelist and forbidNonWhitelisted
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env['PORT'];
  await app.listen(port as string);
}

bootstrap();
