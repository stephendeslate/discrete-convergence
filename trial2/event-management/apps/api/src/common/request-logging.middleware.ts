import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';
import { performance } from 'perf_hooks';

// TRACED:EM-MON-002 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const start = performance.now();

    res.on('finish', () => {
      const duration = Math.round(performance.now() - start);
      const correlationId = (req.headers['x-correlation-id'] as string) ?? '';
      const entry = formatLogEntry({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });
      this.logger.log(entry);
    });

    next();
  }
}
