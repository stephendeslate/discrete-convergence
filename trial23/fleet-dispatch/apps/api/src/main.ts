// TRACED: FD-SEC-001 — Helmet CSP with script-src 'self'
// TRACED: FD-SEC-003 — CORS origin from env, credentials: true
// TRACED: FD-SEC-004 — ValidationPipe whitelist + forbidNonWhitelisted
// TRACED: FD-SEC-005 — No console.log in production; pino conditional
// TRACED: FD-INFRA-001 — Graceful shutdown via enableShutdownHooks
// TRACED: FD-INFRA-002 — Environment-based configuration via validateEnvVars
// TRACED: FD-INFRA-003 — Port from PORT env var with fallback
// TRACED: FD-INFRA-004 — Startup health check log entry
// TRACED: FD-MON-001 — Structured pino logging with correlation ID
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { validateEnvVars } from '@repo/shared';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

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
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Fleet Dispatch API listening on port ${port}`);
}

bootstrap();
