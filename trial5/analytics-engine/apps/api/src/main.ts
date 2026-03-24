// TRACED:AE-INFRA-001 — NestJS bootstrap with Helmet, validation pipe, and Pino logging
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import pino from 'pino';
import { AppModule } from './app.module';
import { validateEnvVars } from '@analytics-engine/shared';

const logger = pino({ level: 'info' });

async function bootstrap(): Promise<void> {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const app = await NestFactory.create(AppModule);

  app.use(helmet());
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

  const port = parseInt(process.env['PORT'] ?? '4000', 10);
  await app.listen(port);
  logger.info({ port }, 'Analytics Engine API started');
}

void bootstrap();
