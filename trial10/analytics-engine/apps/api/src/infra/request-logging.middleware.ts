import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';
import { RequestContextService } from './request-context.service';
import { LoggerService } from './logger.service';

// TRACED: AE-MON-004
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: LoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'HTTP Request',
        correlationId: this.requestContext.correlationId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userId: this.requestContext.userId,
        tenantId: this.requestContext.tenantId,
      });
      this.logger.log(entry, 'HTTP');
    });

    next();
  }
}
