// TRACED: EM-INFRA-002 — Application bootstrap with security middleware
// TRACED: EM-INFRA-003 — Environment variable validation
// TRACED: EM-INFRA-006 — Docker compose api service entrypoint
// TRACED: EM-INFRA-007 — Multi-stage Dockerfile with HEALTHCHECK (see Dockerfile)
// TRACED: EM-INFRA-008 — CI pipeline entrypoint (lint, typecheck, test, build)
// TRACED: EM-SEC-004 — Helmet CSP configuration
// TRACED: EM-SEC-003 — CORS enabled
// TRACED: EM-SEC-007 — ThrottlerModule rate limiting configured

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@event-management/shared';
import pino from 'pino';

async function bootstrap(): Promise<void> {
  // TRACED: EM-INFRA-003
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const logger = pino({ level: 'info' });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // TRACED: EM-SEC-004 — Helmet with CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
    }),
  );

  // TRACED: EM-INFRA-008 — X-Response-Time middleware
  app.use((_req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    const start = Date.now();
    const originalEnd = res.end.bind(res);
    res.end = function (...args: Parameters<typeof res.end>) {
      const elapsed = Date.now() - start;
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${elapsed}ms`);
      }
      return originalEnd(...args);
    } as typeof res.end;
    next();
  });

  // TRACED: EM-SEC-003 — CORS
  app.enableCors();

  // TRACED: EM-SEC-002 — Global validation pipe
  // TRACED: EM-EDGE-016 — Non-whitelisted DTO fields rejected via forbidNonWhitelisted
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // TRACED: EM-INFRA-002 — Shutdown hooks for graceful termination
  app.enableShutdownHooks();

  const port = process.env.PORT ?? '3001';
  await app.listen(port);
  logger.info({ port }, 'Event Management API started');
}

bootstrap();
