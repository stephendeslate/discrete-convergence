// TRACED:AE-INF-001 — Dockerfile uses multi-stage build, node:20-alpine, USER node, HEALTHCHECK
// TRACED:AE-INF-003 — CI/CD has lint+test+build+typecheck+migrate+audit jobs
// TRACED:AE-INF-004 — turbo in root devDependencies, apps use workspace:* protocol
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
// TRACED:AE-SEC-006 — validateEnvVars at startup from shared
import { validateEnvVars } from '@analytics-engine/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN']);

  const app = await NestFactory.create(AppModule);

  // TRACED:AE-SEC-007 — Helmet CSP with required directives
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

  // TRACED:AE-SEC-008 — CORS from CORS_ORIGIN env, no fallback
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  // TRACED:AE-SEC-009 — ValidationPipe with whitelist + forbidNonWhitelisted + transform
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
