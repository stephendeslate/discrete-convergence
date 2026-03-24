// TRACED:AE-INFRA-004 — Environment validation at startup using shared validateEnvVars
// TRACED:AE-SEC-001 — Helmet CSP configuration applied in bootstrap
// TRACED:AE-SEC-003 — CORS from CORS_ORIGIN environment variable with no fallback
// TRACED:AE-SEC-004 — ValidationPipe with whitelist, forbidNonWhitelisted, transform
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@analytics-engine/shared';

async function bootstrap(): Promise<void> {
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
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env['CORS_ORIGIN'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
