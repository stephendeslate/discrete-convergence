import { Injectable } from '@nestjs/common';
import pino from 'pino';

// TRACED:FD-MON-001 — Pino structured JSON logger, DI-injectable
@Injectable()
export class PinoLoggerService {
  private readonly logger = pino({ level: 'info' });

  info(msg: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, msg);
  }

  warn(msg: string, context?: Record<string, unknown>): void {
    this.logger.warn(context ?? {}, msg);
  }

  error(msg: string, context?: Record<string, unknown>): void {
    this.logger.error(context ?? {}, msg);
  }

  debug(msg: string, context?: Record<string, unknown>): void {
    this.logger.debug(context ?? {}, msg);
  }
}
