import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@event-management/shared';
import pino from 'pino';

const logger = pino({ name: 'event-management-api' });

async function bootstrap(): Promise<void> {
  // TRACED:EM-INF-003 — validate required env vars at startup
  validateEnvVars(['JWT_SECRET', 'JWT_REFRESH_SECRET']);

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
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
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);

  app.enableShutdownHooks();

  logger.info({ port }, 'Event Management API started');
}

bootstrap().catch((err) => {
  const startupLogger = pino({ name: 'event-management-startup' });
  startupLogger.error(err, 'Failed to start application');
  process.exit(1);
});
