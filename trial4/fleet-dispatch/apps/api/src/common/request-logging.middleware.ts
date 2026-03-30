// TRACED:FD-MON-002 — RequestLoggingMiddleware logs method, URL, status, duration
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@fleet-dispatch/shared';
import { PinoLoggerService } from '../monitoring/pino-logger.service';
import { RequestContextService } from '../monitoring/request-context.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry({
        level: 'info',
        message: 'HTTP Request',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        correlationId: this.requestContext.getCorrelationId(),
      });
      this.logger.info(entry.message, entry);
    });
    next();
  }
}
