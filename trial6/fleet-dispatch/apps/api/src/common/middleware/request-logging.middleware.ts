// TRACED:FD-MON-010 — request logging middleware with structured log entries
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@fleet-dispatch/shared';
import { PinoLoggerService } from '../services/pino-logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId =
        (req.headers['x-correlation-id'] as string | undefined) ?? '';
      const entry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.url} ${res.statusCode}`,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });
      this.logger.info(entry);
    });

    next();
  }
}
