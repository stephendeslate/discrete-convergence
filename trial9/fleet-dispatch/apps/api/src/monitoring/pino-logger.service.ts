import { Injectable } from '@nestjs/common';
import pino from 'pino';

// TRACED: FD-MON-005
@Injectable()
export class PinoLoggerService {
  private readonly logger = pino({
    level: process.env['LOG_LEVEL'] ?? 'info',
    transport:
      process.env['NODE_ENV'] !== 'production'
        ? { target: 'pino/file', options: { destination: 1 } }
        : undefined,
  });

  info(obj: Record<string, unknown>): void {
    this.logger.info(obj);
  }

  error(obj: Record<string, unknown>): void {
    this.logger.error(obj);
  }

  warn(obj: Record<string, unknown>): void {
    this.logger.warn(obj);
  }

  debug(obj: Record<string, unknown>): void {
    this.logger.debug(obj);
  }
}
