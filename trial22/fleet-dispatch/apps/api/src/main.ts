import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@repo/shared';

// TRACED: FD-INFRA-002
// TRACED: FD-SEC-005
// TRACED: FD-SEC-006
// TRACED: FD-INFRA-005
// TRACED: FD-EDGE-009
// TRACED: FD-EDGE-010
// TRACED: FD-EDGE-012
async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.use(helmet());
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(`Application listening on port ${port}`, 'Bootstrap');
}

bootstrap();
