// TRACED:MAIN-BOOTSTRAP — Application bootstrap with security hardening
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@repo/shared';
import type { EnvConfig } from '@repo/shared';

// Type-annotate process.env for validated environment configuration
const env: Partial<EnvConfig> = process.env as Partial<EnvConfig>;

async function bootstrap(): Promise<void> {
  validateEnvVars();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  // TRACED:FD-APP-005 — Helmet with CSP directives
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      },
    }),
  );

  // TRACED:FD-APP-006 — CORS configuration returning Access-Control-Allow-Origin
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
    credentials: true,
  });

  // TRACED:FD-APP-007 — ValidationPipe with forbidNonWhitelisted
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const port = env.PORT ?? '3001';
  await app.listen(port);
  logger.log(`Fleet Dispatch API listening on port ${port}`);
}

bootstrap();
