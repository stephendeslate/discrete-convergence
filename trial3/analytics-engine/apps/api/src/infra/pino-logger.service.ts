// TRACED:AE-MON-001 — Pino structured JSON logger (DI-injectable)
import { Injectable } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class PinoLoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      formatters: {
        level: (label: string) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

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
