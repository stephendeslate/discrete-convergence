// TRACED: FD-INF-002 — Application bootstrap with validation, CORS, Helmet, shutdown hooks
// TRACED: FD-INF-008 — Docker Compose with api and db services (api depends on db health)
// TRACED: FD-INF-009 — Test Docker Compose with test-db service on port 5433
// TRACED: FD-INF-010 — CI pipeline with GitHub Actions: install, lint, typecheck, migrate, test, build
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@fleet-dispatch/shared';
import pino from 'pino';

async function bootstrap() {
  // TRACED: FD-INF-006 — Validate required environment variables at startup
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const logger = pino({ level: 'info' });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // TRACED: FD-SEC-005 — Helmet with CSP directives
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

  // TRACED: FD-SEC-006 — CORS enabled
  app.enableCors();

  // X-Response-Time middleware — measures and sets elapsed ms on every response
  app.use((req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
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

  // TRACED: FD-SEC-004 — Global validation pipe with whitelist and transform
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // TRACED: FD-INF-005 — Shutdown hooks enabled
  app.enableShutdownHooks();

  const port = process.env.PORT ?? '3001';
  await app.listen(port);
  logger.info({ port }, 'Fleet Dispatch API started');
}

bootstrap();
