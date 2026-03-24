// TRACED:AE-MAIN-001 — Application bootstrap with env validation and security
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@analytics-engine/shared';

async function bootstrap(): Promise<void> {
  validateEnvVars([
    'DATABASE_URL',
    'JWT_SECRET',
    'CORS_ORIGIN',
  ]);

  const app = await NestFactory.create(AppModule);

  // TRACED:AE-SEC-001 — Helmet CSP configuration
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

  // TRACED:AE-SEC-002 — CORS from env, no fallback
  app.enableCors({
    origin: process.env['CORS_ORIGIN'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  // TRACED:AE-SEC-003 — Validation pipe with whitelist and forbidNonWhitelisted
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
