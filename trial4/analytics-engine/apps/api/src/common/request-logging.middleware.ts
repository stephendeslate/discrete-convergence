import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
// TRACED:AE-MON-002 — RequestLoggingMiddleware uses formatLogEntry from shared
import { formatLogEntry } from '@analytics-engine/shared';
import { PinoLoggerService } from '../monitoring/pino-logger.service';
import { RequestContextService } from '../monitoring/request-context.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = performance.now();

    res.on('finish', () => {
      const duration = performance.now() - start;
      const entry = formatLogEntry({
        level: 'info',
        message: 'HTTP Request',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: Math.round(duration),
        correlationId: this.requestContext.correlationId,
      });
      this.logger.info(entry.message, entry);
    });

    next();
  }
}
