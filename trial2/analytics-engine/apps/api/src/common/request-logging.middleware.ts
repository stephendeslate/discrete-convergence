import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';
import { LoggerService } from '../infra/logger.service';
import { RequestContextService } from './request-context.service';

// TRACED:AE-MON-006 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = performance.now();

    res.on('finish', () => {
      const duration = Math.round(performance.now() - start);
      const entry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId: this.requestContext.correlationId,
      });
      this.logger.log(JSON.stringify(entry), 'HTTP');
    });

    next();
  }
}
