import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';
import { PinoLoggerService } from '../infra/pino-logger.service';
import { RequestContextService } from './request-context.service';

// TRACED:EM-MON-005
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
      const logLine = formatLogEntry({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `${req.method} ${req.url}`,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        correlationId: this.requestContext.correlationId,
      });
      this.logger.info(logLine);
    });
    next();
  }
}
