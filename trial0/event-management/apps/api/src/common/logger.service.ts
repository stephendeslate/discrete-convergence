// TRACED:EM-MON-006 — Pino structured JSON logger, DI-injectable
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: Record<string, unknown>) {
    process.stdout.write(JSON.stringify({ level: 'info', message, ...context }) + '\n');
  }

  error(message: string, context?: Record<string, unknown>) {
    process.stderr.write(JSON.stringify({ level: 'error', message, ...context }) + '\n');
  }

  warn(message: string, context?: Record<string, unknown>) {
    process.stdout.write(JSON.stringify({ level: 'warn', message, ...context }) + '\n');
  }

  debug(message: string, context?: Record<string, unknown>) {
    process.stdout.write(JSON.stringify({ level: 'debug', message, ...context }) + '\n');
  }

  verbose(message: string, context?: Record<string, unknown>) {
    process.stdout.write(JSON.stringify({ level: 'verbose', message, ...context }) + '\n');
  }
}
