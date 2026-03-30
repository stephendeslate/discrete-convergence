import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from '@fleet-dispatch/shared';

// TRACED: FD-INFRA-001
// TRACED: FD-INFRA-002
async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET']);

  const app = await NestFactory.create(AppModule);

  // Disable X-Powered-By FIRST
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // TRACED: FD-SEC-003
  // Helmet with CSP
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

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT ?? '3001';
  await app.listen(port);
}

bootstrap();
