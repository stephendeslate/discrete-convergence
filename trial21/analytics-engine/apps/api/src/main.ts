import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import pino from 'pino';
import { AppModule } from './app.module';
import { validateEnvVars } from '@analytics-engine/shared';

/**
 * Application bootstrap.
 * VERIFY: AE-INFRA-005 — main.ts validates env vars and configures security
 * VERIFY: AE-SEC-007 — helmet with CSP frame-ancestors:none
 * VERIFY: AE-SEC-008 — ValidationPipe with whitelist and forbidNonWhitelisted
 */
async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET']); // TRACED: AE-INFRA-005 // TRACED: AE-INFRA-008 // TRACED: AE-INFRA-009

  const logger = pino({ level: 'info' });
  const nestLogger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'none'"], // TRACED: AE-SEC-007
        },
      },
    }),
  );

  app.enableCors({
    origin: process.env['CORS_ORIGIN']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // TRACED: AE-SEC-008 // TRACED: AE-SEC-009
      transform: true,
    }),
  );

  app.enableShutdownHooks(); // TRACED: AE-INFRA-010 // TRACED: AE-INFRA-006 // TRACED: AE-INFRA-007

  const port = process.env['PORT'] ?? '3001';
  await app.listen(port);

  logger.info({ port }, 'Application started');
  nestLogger.log(`Application listening on port ${port}`);
}

bootstrap();
