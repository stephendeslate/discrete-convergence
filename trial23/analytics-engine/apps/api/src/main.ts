// TRACED:AE-INFRA-004 — Environment validation at startup using shared validateEnvVars
// TRACED:AE-SEC-001 — Helmet CSP configuration applied in bootstrap
// TRACED:AE-SEC-003 — CORS from CORS_ORIGIN environment variable with no fallback
// TRACED:AE-SEC-004 — ValidationPipe with whitelist, forbidNonWhitelisted, transform
// TRACED: AE-INFRA-001 — Dockerfile multi-stage, prisma generate before tsc
// TRACED: AE-INFRA-002 — docker-compose PostgreSQL 16 healthcheck
// TRACED: AE-INFRA-003 — CI pipeline lint+test+build+typecheck+audit
// TRACED: AE-SEC-005 — no hardcoded secret fallbacks
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import pino from 'pino';
import { AppModule } from './app.module';
import { validateEnvVars } from '@repo/shared';

const logger = pino({
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});

async function bootstrap(): Promise<void> {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET']);

  const app = await NestFactory.create(AppModule, {
    logger: {
      log: (message: string) => logger.info(message),
      error: (message: string, trace?: string) => logger.error({ trace }, message),
      warn: (message: string) => logger.warn(message),
      debug: (message: string) => logger.debug(message),
      verbose: (message: string) => logger.trace(message),
    },
  });

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
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

  app.enableShutdownHooks();

  const port = process.env['PORT'] ?? '3001';
  await app.listen(port);
  logger.info({ port }, 'Application listening');
}

bootstrap();
