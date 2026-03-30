import { Injectable } from '@nestjs/common';
import pino from 'pino';

// TRACED: AE-MON-008
@Injectable()
export class PinoLoggerService {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino/file', options: { destination: 1 } }
        : undefined,
  });

  log(message: string, context?: Record<string, unknown>) {
    this.logger.info(context ?? {}, message);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.logger.error(context ?? {}, message);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.logger.warn(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.logger.debug(context ?? {}, message);
  }
}
