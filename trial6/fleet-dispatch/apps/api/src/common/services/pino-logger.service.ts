// TRACED:FD-MON-005 — Pino structured JSON logger (DI-injectable)
import { Injectable } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class PinoLoggerService {
  private readonly logger = pino({ level: 'info' });

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.logger.error(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context ?? {}, message);
  }
}
