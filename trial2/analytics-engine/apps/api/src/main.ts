import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@analytics-engine/shared';
import { LoggerService } from './infra/logger.service';

// TRACED:AE-SEC-004 — main.ts with validateEnvVars, Helmet CSP, CORS, ValidationPipe
// TRACED:AE-INFRA-002 — Multi-stage Dockerfile with node:20-alpine, USER node, HEALTHCHECK, LABEL (entrypoint)
async function bootstrap() {
  validateEnvVars([
    'DATABASE_URL',
    'JWT_SECRET',
    'CORS_ORIGIN',
  ]);

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(new LoggerService());

  // TRACED:AE-SEC-005 — Helmet CSP with required directives
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

  // TRACED:AE-SEC-006 — CORS from CORS_ORIGIN env with credentials and explicit headers/methods
  app.enableCors({
    origin: process.env['CORS_ORIGIN'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  // TRACED:AE-SEC-007 — ValidationPipe with whitelist + forbidNonWhitelisted + transform
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
