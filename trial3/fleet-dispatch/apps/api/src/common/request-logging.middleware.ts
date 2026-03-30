import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@fleet-dispatch/shared';
import { RequestContextService } from './request-context.service';
import pino from 'pino';

// TRACED:FD-MON-008
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger: pino.Logger;

  constructor(
    @Inject('PINO_LOGGER') logger: pino.Logger,
    private readonly requestContext: RequestContextService,
  ) {
    this.logger = logger;
  }

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
        correlationId: this.requestContext.correlationId,
      });
      this.logger.info(entry);
    });

    next();
  }
}
