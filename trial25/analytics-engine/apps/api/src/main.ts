// TRACED:MAIN-BOOTSTRAP — NestJS application entry point
// TRACED:SEC-HELMET — helmet() middleware with CSP directives (VERIFY:SEC-HELMET)
// TRACED:SEC-VALIDATION — global ValidationPipe with whitelist + forbidNonWhitelisted (VERIFY:SEC-VALIDATION)
// TRACED:API-VALIDATION-PIPE — ValidationPipe({whitelist,forbidNonWhitelisted,transform}) (VERIFY:API-VALIDATION-PIPE)
// TRACED:SEC-THROTTLE — ThrottlerModule registered as APP_GUARD (VERIFY:SEC-THROTTLE)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { validateEnvVars, APP_VERSION, sanitizeLogContext } from '@repo/shared';

async function bootstrap(): Promise<void> {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        frameAncestors: ["'none'"],
      },
    },
  }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.enableShutdownHooks();
  const port = process.env.PORT ?? '3001';
  const startCtx = sanitizeLogContext({ version: APP_VERSION, port, env: process.env.NODE_ENV ?? 'development' }) as Record<string, unknown>;
  app.get(Logger).log(`Starting Analytics Engine v${String(startCtx['version'])} on port ${String(startCtx['port'])}`);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
