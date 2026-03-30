import { Injectable } from '@nestjs/common';
import pino from 'pino';

// TRACED:EM-MON-002
@Injectable()
export class PinoLoggerService {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
  });

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.logger.error(context ?? {}, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context ?? {}, message);
  }
}
