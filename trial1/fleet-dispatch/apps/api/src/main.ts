import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@fleet-dispatch/shared';

// TRACED:FD-INF-002 — Docker entrypoint: this bootstrap runs inside the multi-stage container
// TRACED:FD-INF-003 — Environment validation at startup
// TRACED:FD-INF-004 — CI pipeline target: this module is built and tested by turbo in GitHub Actions
validateEnvVars([
  'DATABASE_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
]);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // TRACED:FD-SEC-001 — Helmet CSP configuration
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

  // TRACED:FD-SEC-005 — CORS configuration from environment
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  // TRACED:FD-SEC-004 — Global validation pipe with whitelist and forbidNonWhitelisted
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
