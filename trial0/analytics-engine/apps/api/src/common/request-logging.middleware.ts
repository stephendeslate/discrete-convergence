// TRACED:AE-MON-004 — Request logging middleware with structured format
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';
import { RequestContextService } from './request-context.service';
import { AppLogger } from './logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: AppLogger,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId = this.requestContext.getCorrelationId();
      const logEntry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.originalUrl}`,
        correlationId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      });
      this.logger.log(logEntry);
    });

    next();
  }
}
