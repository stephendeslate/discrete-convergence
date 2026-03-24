// TRACED:FD-MON-006
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { formatLogEntry, sanitizeLogContext } from 'shared';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: Record<string, unknown>) {
    const sanitized = context ? sanitizeLogContext(context) as Record<string, unknown> : undefined;
    process.stderr.write(formatLogEntry('info', message, undefined, sanitized) + '\n');
  }

  error(message: string, trace?: string, context?: Record<string, unknown>) {
    const sanitized = context ? sanitizeLogContext(context) as Record<string, unknown> : undefined;
    process.stderr.write(formatLogEntry('error', message, undefined, { ...sanitized, trace }) + '\n');
  }

  warn(message: string, context?: Record<string, unknown>) {
    const sanitized = context ? sanitizeLogContext(context) as Record<string, unknown> : undefined;
    process.stderr.write(formatLogEntry('warn', message, undefined, sanitized) + '\n');
  }

  debug(message: string, context?: Record<string, unknown>) {
    const sanitized = context ? sanitizeLogContext(context) as Record<string, unknown> : undefined;
    process.stderr.write(formatLogEntry('debug', message, undefined, sanitized) + '\n');
  }

  verbose(message: string, context?: Record<string, unknown>) {
    const sanitized = context ? sanitizeLogContext(context) as Record<string, unknown> : undefined;
    process.stderr.write(formatLogEntry('verbose', message, undefined, sanitized) + '\n');
  }
}
