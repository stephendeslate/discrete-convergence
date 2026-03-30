import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@analytics-engine/shared';
import pino from 'pino';

// TRACED: AE-INFRA-001 — NestJS bootstrap with env validation
// TRACED: AE-INFRA-002 — Helmet security headers with CSP
// TRACED: AE-INFRA-003 — CORS configuration
// TRACED: AE-INFRA-004 — Global validation pipe
// TRACED: AE-INFRA-005 — Graceful shutdown hooks
// TRACED: AE-SEC-003 — Helmet CSP with frame-ancestors
// TRACED: AE-SEC-004 — ValidationPipe whitelist + forbidNonWhitelisted
// TRACED: AE-SEC-005 — CORS with configurable origin
async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const logger = pino({ level: 'info' });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

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
          frameAncestors: ["'self'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const port = process.env.PORT ?? '3001';
  await app.listen(port);
  logger.info({ port }, 'Analytics Engine API started');
}
bootstrap();
