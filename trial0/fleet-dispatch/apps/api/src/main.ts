// TRACED:FD-MAIN-001
// TRACED:FD-SEC-001
// TRACED:FD-SEC-002
// TRACED:FD-SEC-003
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnvVars } from 'shared';

async function bootstrap() {
  validateEnvVars(['DATABASE_URL', 'JWT_SECRET']);

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  process.stderr.write(`Fleet Dispatch API running on port ${port}\n`);
}

void bootstrap();
