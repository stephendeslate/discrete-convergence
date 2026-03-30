import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@fleet-dispatch/shared';
import { PinoLoggerService } from '../services/pino-logger.service';

// TRACED:FD-MON-004 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId = (req.headers['x-correlation-id'] as string) ?? '';
      const entry = formatLogEntry({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });
      this.logger.info(entry);
    });

    next();
  }
}
