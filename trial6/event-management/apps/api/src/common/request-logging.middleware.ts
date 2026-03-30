// TRACED:EM-MON-008 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';
import { RequestContextService } from './request-context.service';
import pino from 'pino';

const logger = pino({ level: 'info' });

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = performance.now();
    res.on('finish', () => {
      const duration = Math.round(performance.now() - start);
      const entry = formatLogEntry({
        level: 'info',
        message: 'HTTP Request',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId: this.requestContext.getCorrelationId(),
      });
      logger.info(entry);
    });
    next();
  }
}
