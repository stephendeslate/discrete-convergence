// TRACED:EM-MON-004
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';
import { RequestContextService } from './request-context.service';
import { PinoLoggerService } from './logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: PinoLoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'HTTP Request',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId: this.requestContext.correlationId,
      });
      this.logger.log(entry);
    });

    next();
  }
}
