// TRACED: EM-SEC-001 — Helmet CSP default-src self, frame-ancestors none
// TRACED: EM-SEC-003 — CORS from CORS_ORIGIN env, credentials true
// TRACED: EM-SEC-004 — ValidationPipe whitelist + forbidNonWhitelisted
// TRACED: EM-SEC-005 — No hardcoded secret fallbacks
// TRACED: EM-INFRA-001 — Multi-stage Dockerfile, prisma generate before tsc
// TRACED: EM-INFRA-002 — docker-compose PostgreSQL 16 healthcheck
// TRACED: EM-INFRA-003 — CI: lint + test + build + typecheck + audit
// TRACED: EM-INFRA-004 — validateEnvVars at startup
// TRACED: EM-MON-001 — Pino JSON logging, pino-pretty in development
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { validateEnvVars } from '@repo/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  validateEnvVars([
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CORS_ORIGIN',
  ]);

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    ...(process.env.NODE_ENV === 'development'
      ? {
          logger: ['log', 'error', 'warn', 'debug', 'verbose'],
        }
      : {}),
  });

  app.useLogger(app.get(Logger));

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
    origin: process.env.CORS_ORIGIN,
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

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
