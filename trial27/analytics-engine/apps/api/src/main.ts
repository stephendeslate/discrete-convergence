import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { validateEnvVars } from '@analytics-engine/shared';
import pino from 'pino';

// TRACED: AE-INFRA-001 — Dockerfile
// TRACED: AE-INFRA-002 — Docker Compose
// TRACED: AE-INFRA-004 — Shutdown hooks
// TRACED: AE-INFRA-005 — Environment validation
// TRACED: AE-SEC-005 — Validation pipeline

async function bootstrap(): Promise<void> {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const logger = pino({ level: 'info' });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // X-Response-Time middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
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
          frameSrc: ["'self'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
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

  const port = process.env.PORT ?? '3001';
  await app.listen(port);
  logger.info({ port }, 'Analytics Engine API started');
}

void bootstrap();
