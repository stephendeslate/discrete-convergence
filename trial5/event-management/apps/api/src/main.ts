// TRACED:EM-INFRA-003 — Application bootstrap with Helmet, ValidationPipe, correlation middleware
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@event-management/shared';
import pino from 'pino';

const logger = pino({ level: 'info' });

async function bootstrap(): Promise<void> {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.use(helmet());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  logger.info({ port }, 'Application started');
}

void bootstrap();
