import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateEnvVars } from '@fleet-dispatch/shared';
import helmet from 'helmet';
import pino from 'pino';

const logger = pino({ name: 'fleet-dispatch-api' });

async function bootstrap(): Promise<void> {
  validateEnvVars(['JWT_SECRET', 'JWT_REFRESH_SECRET']);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
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
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3001',
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

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  logger.info({ port }, 'Fleet Dispatch API started');
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start application');
  process.exit(1);
});
