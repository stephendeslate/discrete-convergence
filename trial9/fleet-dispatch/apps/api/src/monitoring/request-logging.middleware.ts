import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@fleet-dispatch/shared';
import { RequestContextService } from './request-context.service';
import { PinoLoggerService } from './pino-logger.service';

// TRACED: FD-MON-008
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
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        correlationId: this.requestContext.getCorrelationId(),
      });

      this.logger.info({ message: 'Request completed', logEntry: entry });
    });

    next();
  }
}
